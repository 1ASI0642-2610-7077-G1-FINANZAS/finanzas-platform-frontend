import {Component, inject} from '@angular/core';
import {SimulationStateService} from '../../services/simulation-state-service';
import {CommonModule, DecimalPipe} from '@angular/common';

@Component({
  selector: 'app-pagos',
  imports: [
    DecimalPipe,
    CommonModule
  ],
  templateUrl: './pagos.html',
  styleUrl: './pagos.css',
})
export class Pagos {
  private readonly simulationState =
    inject(SimulationStateService);

  cronograma: any[] = [];

  currentPage = 1;

  pageSize = 10;


  ngOnInit(): void {

    const resultado =
      this.simulationState.resultado;

    if (resultado) {
      this.cronograma = resultado.cronograma;
    }
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
