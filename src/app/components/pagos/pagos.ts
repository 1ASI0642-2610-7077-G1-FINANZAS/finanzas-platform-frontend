import {Component, inject} from '@angular/core';
import {SimulationStateService} from '../../services/simulation-state-service';
import {CommonModule, DecimalPipe} from '@angular/common';
import { RouterModule } from '@angular/router';
import {ClienteService} from '../../services/cliente-service';
import {VehiculoService} from '../../services/vehiculo-service';
import {CreditoService} from '../../services/credito-service';
import {Cliente} from '../../model/cliente';
import {Vehiculo} from '../../model/vehiculo';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-pagos',
  imports: [
    DecimalPipe,
    CommonModule, RouterModule, FormsModule
  ],
  templateUrl: './pagos.html',
  styleUrl: './pagos.css',
})
export class Pagos {
  protected readonly simulationState =
    inject(SimulationStateService);

  private readonly clienteService =
    inject(ClienteService);

  private readonly vehiculoService =
    inject(VehiculoService);

  private readonly creditoService =
    inject(CreditoService);

  clientes: Cliente[] = [];

  vehiculos: Vehiculo[] = [];

  selectedCliente?: number;

  selectedVehiculo?: number;

  cronograma: any[] = [];

  currentPage = 1;

  pageSize = 10;


  ngOnInit(): void {

    const resultado =
      this.simulationState.resultado;

    const creditoRequest =
      this.simulationState.creditoRequest;

    console.log(creditoRequest);

    this.obtenerClientes();

    this.obtenerVehiculos();

    if (resultado) {
      this.cronograma = resultado.cronograma;
    }
  }

  obtenerClientes(): void {

    this.clienteService
      .listarClientes()
      .subscribe({

        next: (clientes) => {

          this.clientes = clientes;

          console.log(clientes);
        },

        error: (error) => {
          console.error(error);
        }
      });
  }

  obtenerVehiculos(): void {

    this.vehiculoService
      .listarVehiculos()
      .subscribe({

        next: (vehiculos) => {

          this.vehiculos = vehiculos;

          console.log(vehiculos);
        },

        error: (error) => {
          console.error(error);
        }
      });
  }

  crearCredito(): void {

    if (!this.selectedCliente) {
      alert('Seleccione un cliente');
      return;
    }

    if (!this.selectedVehiculo) {
      alert('Seleccione un vehículo');
      return;
    }

    const request = this.simulationState.creditoRequest;

    if (!request) {
      alert('No existe simulación previa');
      return;
    }

    const creditoRequest = {
      ...request,
      idCliente: this.selectedCliente,
      idVehiculo: this.selectedVehiculo
    };

    console.log(
      JSON.stringify(creditoRequest, null, 2)
    );

    this.creditoService.crearCredito(creditoRequest)
      .subscribe({

        next: () => {
          alert('Crédito creado correctamente');
        },

        error: (error) => {
          console.error(error);
          console.log(creditoRequest);
          alert('Error al crear crédito');
        }
      });
  }

  get paginatedCronograma() {

    const start =
      (this.currentPage - 1) * this.pageSize;

    const end =
      start + this.pageSize;

    return this.cronograma.slice(start, end);
  }

  get totalPages(): number {

    return Math.ceil(
      this.cronograma.length / this.pageSize
    );
  }

  changePage(page: number): void {

    if (
      page >= 1 &&
      page <= this.totalPages
    ) {
      this.currentPage = page;
    }
  }
}
