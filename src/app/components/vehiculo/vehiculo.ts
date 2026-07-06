import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Vehiculo as VehiculoModel } from '../../model/vehiculo';
import { VehiculoService } from '../../services/vehiculo-service';

@Component({
  selector: 'app-vehiculo',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './vehiculo.html',
  styleUrl: './vehiculo.css',
})
export class Vehiculo implements OnInit {
  private vehiculoService = inject(VehiculoService);
  private router = inject(Router);

  // ====== ESTADO ======
  vehiculos = signal<VehiculoModel[]>([]);
  cargando = signal<boolean>(false);
  error = signal<string | null>(null);

  // Filtros
  filtroMarca = signal<string>('TODAS');
  filtroAnio = signal<string>('TODOS');

  // Modal
  modalAbierto = signal<boolean>(false);
  modoEdicion = signal<boolean>(false);
  vehiculoForm = signal<VehiculoModel>(this.formularioVacio());

  // Modal de detalles
  detallesAbierto = signal<boolean>(false);
  vehiculoDetalle = signal<VehiculoModel | null>(null);

  // ====== DERIVADOS ======
  marcasDisponibles = computed(() => {
    const marcas = new Set(this.vehiculos().map((v) => v.marca));
    return Array.from(marcas).sort();
  });

  aniosDisponibles = computed(() => {
    const anios = new Set(this.vehiculos().map((v) => v.anio));
    return Array.from(anios).sort((a, b) => b - a);
  });

  vehiculosFiltrados = computed(() => {
    const marca = this.filtroMarca();
    const anio = this.filtroAnio();
    return this.vehiculos().filter((v) => {
      const okMarca = marca === 'TODAS' || v.marca === marca;
      const okAnio = anio === 'TODOS' || v.anio === Number(anio);
      return okMarca && okAnio;
    });
  });

  // ====== LIFECYCLE ======
  ngOnInit(): void {
    this.cargarVehiculos();
  }

  // ====== CARGA ======
  cargarVehiculos(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.vehiculoService.listarVehiculos().subscribe({
      next: (data) => {
        this.vehiculos.set(data);
        this.cargando.set(false);
      },
      error: (err) => {
        this.error.set('No se pudo cargar el inventario. Verifica que el backend esté corriendo.');
        this.cargando.set(false);
        console.error(err);
      },
    });
  }

  // ====== FILTROS ======
  aplicarFiltroMarca(marca: string): void {
    this.filtroMarca.set(marca);
  }

  aplicarFiltroAnio(anio: string): void {
    this.filtroAnio.set(anio);
  }

  // ====== MODAL CREAR / EDITAR ======
  abrirNuevo(): void {
    this.modoEdicion.set(false);
    this.vehiculoForm.set(this.formularioVacio());
    this.modalAbierto.set(true);
  }

  abrirEditar(v: VehiculoModel): void {
    this.modoEdicion.set(true);
    this.vehiculoForm.set({ ...v });
    this.modalAbierto.set(true);
  }

  cerrarModal(): void {
    this.modalAbierto.set(false);
  }

  actualizarCampo<K extends keyof VehiculoModel>(campo: K, valor: VehiculoModel[K]): void {
    this.vehiculoForm.update((v) => ({ ...v, [campo]: valor }));
  }

  guardar(): void {
    const v = this.vehiculoForm();

    // Obtenemos el mensaje de error (si existe)
    const errorMsg = this.validarReglasDeNegocio(v);

    if (errorMsg) {
      alert(errorMsg); // ¡Aquí está el alert que pediste!
      return;
    }

    if (this.modoEdicion() && v.idVehiculo != null) {
      this.vehiculoService.actualizar(v.idVehiculo, v).subscribe({
        next: () => {
          this.cerrarModal();
          this.cargarVehiculos();
        },
        error: (err) => {
          alert('Error al actualizar el vehículo.');
          console.error(err);
        },
      });
    } else {
      this.vehiculoService.crear(v).subscribe({
        next: () => {
          this.cerrarModal();
          this.cargarVehiculos();
        },
        error: (err) => {
          alert('Error al crear el vehículo.');
          console.error(err);
        },
      });
    }
  }

  // ====== NUEVA FUNCIÓN DE VALIDACIÓN ======
  private validarReglasDeNegocio(v: VehiculoModel): string | null {
    if (!v.marca?.trim() || !v.modelo?.trim()) {
      return 'Completa los campos obligatorios: Marca y Modelo.';
    }
    if (v.anio < 1980 || v.anio > 2030) {
      return 'Por favor, ingresa un año válido para el vehículo.';
    }
    // Validación estricta del precio
    if (v.precio < 5000 || v.precio > 500000) {
      return '⛔ RECHAZADO: Según las políticas comerciales, el precio del vehículo debe estar entre 5,000 y 500,000 (PEN/USD).';
    }
    return null; // Null significa que todo está perfecto
  }

  // ====== ELIMINAR ======
  eliminar(v: VehiculoModel): void {
    if (v.idVehiculo == null) return;
    const ok = confirm(`¿Eliminar "${v.marca} ${v.modelo}" del inventario?`);
    if (!ok) return;

    this.vehiculoService.eliminar(v.idVehiculo).subscribe({
      next: () => this.cargarVehiculos(),
      error: (err) => {
        alert(
          'No se pudo eliminar. Es posible que el vehículo esté asociado a un crédito existente.',
        );
        console.error(err);
      },
    });
  }

  // ====== DETALLES ======
  verDetalles(v: VehiculoModel): void {
    this.vehiculoDetalle.set(v);
    this.detallesAbierto.set(true);
  }

  cerrarDetalles(): void {
    this.detallesAbierto.set(false);
  }

  // ====== SELECCIÓN PARA SIMULADOR ======
  seleccionar(v: VehiculoModel): void {
    this.vehiculoService.guardarSeleccionado(v);
    this.router.navigate(['/QCSFINANCE/simulation']);
  }

  // ====== UTILIDADES ======
  formatearPrecio(v: VehiculoModel): string {
    const simbolo = v.moneda === 'USD' ? '$' : 'S/';
    return `${simbolo} ${v.precio.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;
  }

  private formularioVacio(): VehiculoModel {
    return {
      marca: '',
      modelo: '',
      anio: new Date().getFullYear(),
      moneda: 'PEN',
      precio: 0,
      descripcion: '',
    };
  }

  private formularioValido(v: VehiculoModel): boolean {
    return (
      !!v.marca?.trim() &&
      !!v.modelo?.trim() &&
      v.anio > 1900 &&
      (v.moneda === 'PEN' || v.moneda === 'USD') &&
      v.precio > 0
    );
  }
}
