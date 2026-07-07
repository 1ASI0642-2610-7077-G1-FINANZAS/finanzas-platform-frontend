import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, RouterModule } from '@angular/router';

import { CreditoService } from '../../services/credito-service';
import { ResultadoCalculo } from '../../model/resultado-calculo';
import { CronogramaFila } from '../../model/cronograma-fila';
import { SimulationStateService } from '../../services/simulation-state-service';

// IMPORTANTE: estas rutas deben coincidir con donde colocaste los archivos
// vehiculo.model.ts, vehiculo.service.ts, cliente.model.ts, cliente.service.ts
import { VehiculoService } from '../../services/vehiculo-service';
import { Vehiculo } from '../../model/vehiculo';
import { ClienteService } from '../../services/cliente-service';
import { Cliente } from '../../model/cliente';

@Component({
  selector: 'app-simulation',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatRadioModule,
    MatSelectModule,
    MatSliderModule,
    MatSnackBarModule,
    RouterModule,
  ],
  templateUrl: './simulation.html',
  styleUrl: './simulation.css',
})
export class Simulation implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly snackBar = inject(MatSnackBar);
  private readonly creditoService = inject(CreditoService);
  private readonly router = inject(Router);
  private readonly simulationState = inject(SimulationStateService);
  private readonly vehiculoService = inject(VehiculoService);
  private readonly clienteService = inject(ClienteService);

  // ===== ESTADO =====
  vehiculoSeleccionado = signal<Vehiculo | null>(null);
  clientes = signal<Cliente[]>([]);

  resultado?: ResultadoCalculo;
  cronograma: CronogramaFila[] = [];

  // ===== FORM =====
  readonly simulationForm = this.fb.group({
    idCliente: [0, [Validators.required, Validators.min(1)]],
    initialQuotaPercent: [20, [Validators.required, Validators.min(0), Validators.max(45)]],
    rateType: ['TEA'],
    rateValue: [8.49, [Validators.required, Validators.min(8.49), Validators.max(24.99)]],
    capitalizationFrequency: [{ value: 'No Aplica (Efectiva)', disabled: true }],
    totalMonths: [36, [Validators.required, Validators.min(24), Validators.max(36)]],
    gracePeriodType: ['Sin Gracia'],
    gracePeriodDuration: [0, [Validators.required, Validators.min(0)]],
    valorResidualPercent: [35, [Validators.required, Validators.min(1), Validators.max(50)]],
    seguroDesgravamen: [0.077, [Validators.min(0.0375), Validators.max(0.0800)]],
    seguroVehicular: [0.2700, [Validators.min(0.2700), Validators.max(4.90)]],
    portes: [0],
  });

  // ===== VALORES CALCULADOS EN VIVO =====
  cuotaInicialMonto = 0;
  financedCapital = 0;
  valorResidualMonto = 0;

  // Resumen de proyección (se llena tras simular)
  estimatedMonthlyPayment = 0;
  projectedTotalInterest = 0;
  gracePeriodAccumulation = 0;
  totalDisbursement = 0;
  appliedRate = 0;

  // ===== LIFECYCLE =====
  ngOnInit(): void {
    // 1. Verificar vehículo seleccionado
    const veh = this.vehiculoService.obtenerSeleccionado();
    if (!veh) {
      this.snackBar.open('Primero debes seleccionar un vehículo', 'Ir', {
        duration: 4000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
      this.router.navigate(['/QCSFINANCE/seleccion_vehiculo']);
      return;
    }
    this.vehiculoSeleccionado.set(veh);

    // 2. Cargar clientes del backend
    this.clienteService.listarClientes().subscribe({
      next: (data) => {
        this.clientes.set(data);
        if (data.length === 0) {
          this.snackBar.open('No hay clientes registrados. Registra uno primero.', 'Cerrar', {
            duration: 4000,
          });
        }
      },
      error: (err) => {
        console.error('Error cargando clientes:', err);
        this.snackBar.open('No se pudieron cargar los clientes', 'Cerrar', { duration: 4000 });
      },
    });

    // 3. Cambiar frecuencia según tipo de tasa
    this.simulationForm.get('rateType')?.valueChanges.subscribe((type) => {
      const freqControl = this.simulationForm.get('capitalizationFrequency');
      if (type === 'TEA') {
        freqControl?.setValue('No Aplica (Efectiva)');
        freqControl?.disable();
      } else {
        freqControl?.setValue('Mensual');
        freqControl?.enable();
      }
    });

    // 4. Ajustar duración de gracia automáticamente si no hay gracia
    this.simulationForm.get('gracePeriodType')?.valueChanges.subscribe((tipo) => {
      if (tipo === 'Sin Gracia') {
        this.simulationForm.get('gracePeriodDuration')?.setValue(0);
      }
    });

    // 5. Recalcular preview en vivo
    this.simulationForm.valueChanges.subscribe(() => this.recalcularPreview());
    this.recalcularPreview();
  }

  // ===== PREVIEW EN VIVO =====
  private recalcularPreview(): void {
    const v = this.vehiculoSeleccionado();
    if (!v) return;

    const pctInicial = this.simulationForm.get('initialQuotaPercent')?.value ?? 0;
    let pctResidual = this.simulationForm.get('valorResidualPercent')?.value ?? 0;

    // 1. Obtenemos el tope dinámico
    const finalMax = this.maxResidualPermitido;

    // 2. Ajustar el control del formulario dinámicamente
    const residualControl = this.simulationForm.get('valorResidualPercent');
    if (residualControl) {
      residualControl.setValidators([
        Validators.required,
        Validators.min(0),
        Validators.max(finalMax)
      ]);

      // Si el usuario mueve la inicial muy alto y el residual queda fuera de límite, lo bajamos
      if (pctResidual > finalMax) {
        pctResidual = finalMax;
        residualControl.setValue(finalMax, { emitEvent: false });
      }

      residualControl.updateValueAndValidity({ emitEvent: false });
    }

    // 3. Cálculos finales para la vista HTML
    this.cuotaInicialMonto = +(v.precio * (pctInicial / 100)).toFixed(2);
    this.financedCapital = +(v.precio - this.cuotaInicialMonto).toFixed(2);
    this.valorResidualMonto = +(v.precio * (pctResidual / 100)).toFixed(2);
  }

  // ===== ACCIONES =====
  cambiarVehiculo(): void {
    this.router.navigate(['/QCSFINANCE/seleccion_vehiculo']);
  }

  generateAmortization(): void {
    const v = this.vehiculoSeleccionado();
    if (!v) {
      this.snackBar.open('No hay vehículo seleccionado', 'Cerrar', { duration: 3000 });
      return;
    }
    if (this.simulationForm.invalid) {
      this.simulationForm.markAllAsTouched();

      const controls = this.simulationForm.controls;
      let mensajeAlerta = 'Revisa los campos marcados en rojo.';

      // Validamos uno por uno para mostrar el alert correcto
      if (controls.initialQuotaPercent.hasError('min') || controls.initialQuotaPercent.hasError('max')) {
        mensajeAlerta = 'Política de banco: La cuota inicial debe estar entre 0% y 45%.';
      }
      else if (controls.rateValue.hasError('min') || controls.rateValue.hasError('max')) {
        mensajeAlerta = 'Política de mercado: La TEA para Compra Inteligente debe estar entre 8.49% y 24.99%.';
      }
      else if (controls.valorResidualPercent.hasError('min') || controls.valorResidualPercent.hasError('max')) {
        mensajeAlerta = 'Estructura Balloon: El Valor Residual final debe ser entre 30% y 50%.';
      }
      else if (controls.seguroDesgravamen.hasError('min') || controls.seguroDesgravamen.hasError('max')) {
        mensajeAlerta = 'Tasa regulatoria: El seguro de desgravamen debe estar entre 0.0375% y 0.800% mensual.';
      }
      else if (controls.seguroVehicular?.hasError('min') || controls.seguroVehicular?.hasError('max')) {
        mensajeAlerta = 'Perfil de Riesgo: El seguro vehicular debe estar entre 0.27% y 4.90% anual.';
      }

      // Mostramos la alerta emergente
      this.snackBar.open('❌ ' + mensajeAlerta, 'Corregir', {
        duration: 6000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
      return;
    }

    const fv = this.simulationForm.getRawValue();
    const cuotaInicial = +(v.precio * (fv.initialQuotaPercent / 100)).toFixed(2);
    const valorResidual = +(v.precio * (fv.valorResidualPercent / 100)).toFixed(2);

    const seguroRiesgoMensual = +(((fv.seguroVehicular / 100) * v.precio) / 12).toFixed(2);

    const request = {
      idCliente: fv.idCliente,
      idVehiculo: v.idVehiculo!,
      moneda: 'PEN',
      tipoTasa: fv.rateType === 'TEA' ? 'EFECTIVA' : 'NOMINAL',
      tasaInteres: fv.rateValue,
      tasaDescuento: fv.rateValue + 2,
      frecuenciaCapitalizacion: 'MENSUAL',
      plazoMeses: fv.totalMonths,
      tipoGracia: this.mapGraceType(fv.gracePeriodType),
      periodoGracia: fv.gracePeriodDuration,
      precioVehiculo: v.precio,
      cuotaInicial: cuotaInicial,
      valorResidual: valorResidual,
      seguroDesgravamen: fv.seguroDesgravamen,
      seguroVehicular: seguroRiesgoMensual,
      portes: 0,
      fechaInicio: new Date().toISOString().split('T')[0],
    };

    this.simulationState.resultado = undefined;
    this.simulationState.creditoRequest = undefined;
    this.cronograma = [];

    this.creditoService.simular(request).subscribe({
      next: (response) => {
        this.resultado = response;
        this.cronograma = response.cronograma;
        this.estimatedMonthlyPayment = response.cuotaOrdinaria;
        this.projectedTotalInterest = response.totalIntereses;
        this.totalDisbursement = response.totalPagado;
        this.appliedRate = response.tea * 100;

        this.simulationState.resultado = response;
        this.simulationState.creditoRequest = request;

        this.snackBar.open('Cronograma generado correctamente', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
        this.router.navigateByUrl('/QCSFINANCE/pagos');
      },
      error: (err) => {
        console.error(err);
        const msg = err?.error?.message || 'Error al generar simulación';
        this.snackBar.open(msg, 'Cerrar', { duration: 4000 });
      },
    });
  }

  saveScenario(): void {
    this.snackBar.open('Funcionalidad pendiente', 'Cerrar', { duration: 3000 });
  }

  // ===== UTILIDADES =====
  private mapGraceType(value: string | null | undefined): string {
    switch (value) {
      case 'Total':
        return 'TOTAL';
      case 'Parcial (Solo Interés)':
        return 'PARCIAL';
      default:
        return 'SIN_GRACIA';
    }
  }

  nombreCliente(c: Cliente): string {
    return `${c.nombres} ${c.apellidos} — ${c.tipoDocumento} ${c.numeroDocumento}`;
  }

  get maxResidualPermitido(): number {
    const pctInicial = this.simulationForm.get('initialQuotaPercent')?.value ?? 0;
    // El límite es 100 menos la inicial, pero topeado a 50% por regla de Compra Inteligente
    return Math.min(50, 100 - pctInicial);
  }
}
