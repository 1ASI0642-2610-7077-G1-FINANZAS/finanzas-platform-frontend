import { Component, inject, OnInit } from '@angular/core';
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
import {CreditoService} from '../../services/credito-service';
import {ResultadoCalculo} from '../../model/resultado-calculo';
import {CronogramaFila} from '../../model/cronograma-fila';
import {Router, RouterModule} from '@angular/router';
import {SimulationStateService} from '../../services/simulation-state-service';
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
    MatSnackBarModule,RouterModule
  ],
  templateUrl: './simulation.html',
  styleUrl: './simulation.css',
})
export class Simulation {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly snackBar = inject(MatSnackBar);
  private readonly creditoService = inject(CreditoService);
  private readonly router = inject(Router);
  private readonly simulationState = inject(SimulationStateService);

  resultado?: ResultadoCalculo;

  cronograma: CronogramaFila[] = [];

  readonly simulationForm = this.fb.group({
    currency: ['PEN'],
    amount: [45000.00, [Validators.required, Validators.min(1000)]],
    initialQuotaPercent: [20, [Validators.required, Validators.min(0), Validators.max(100)]],
    rateType: ['TEA'],
    rateValue: [14.50, [Validators.required, Validators.min(0)]],
    capitalizationFrequency: [{ value: 'No Aplica (Efectiva)', disabled: true }],
    totalMonths: [36, [Validators.required, Validators.min(1)]],
    gracePeriodType: ['Parcial (Solo Interés)'],
    gracePeriodDuration: [2, [Validators.required, Validators.min(0)]]
  });

  estimatedMonthlyPayment = 0;
  financedCapital = 0;
  projectedTotalInterest = 0;
  gracePeriodAccumulation = 0;
  totalDisbursement = 0;
  appliedRate = 0;

  ngOnInit(): void {

    this.simulationForm.get('rateType')
      ?.valueChanges.subscribe(type => {

      const freqControl =
        this.simulationForm.get('capitalizationFrequency');

      if (type === 'TEA') {
        freqControl?.setValue('No Aplica (Efectiva)');
        freqControl?.disable();
      } else {
        freqControl?.setValue('Mensual');
        freqControl?.enable();
      }
    });

    this.simulationForm.valueChanges.subscribe(() => {

      const amount =
        this.simulationForm.get('amount')?.value ?? 0;

      this.financedCapital = amount;
    });
  }

  generateAmortization(): void {

    if (this.simulationForm.invalid) {
      return;
    }

    const amount =
      this.simulationForm.get('amount')?.value ?? 0;

    const initialPercent =
      this.simulationForm.get('initialQuotaPercent')?.value ?? 0;

    const cuotaInicial =
      amount * (initialPercent / 100);

    const request = {

      idCliente: 1,
      idVehiculo: 1,

      moneda: 'PEN',

      tipoTasa:
        this.simulationForm.get('rateType')?.value === 'TEA'
          ? 'EFECTIVA'
          : 'NOMINAL',

      tasaInteres:
        this.simulationForm.get('rateValue')?.value ?? 0,

      frecuenciaCapitalizacion: 'MENSUAL',

      plazoMeses:
        this.simulationForm.get('totalMonths')?.value ?? 12,

      tipoGracia:
        this.mapGraceType(
          this.simulationForm.get('gracePeriodType')?.value
        ),

      periodoGracia:
        this.simulationForm.get('gracePeriodDuration')?.value ?? 0,

      precioVehiculo: amount,

      cuotaInicial: cuotaInicial,

      valorResidual: 5000,

      seguroDesgravamen: 0.077,

      seguroVehicular: 0,

      portes: 0,

      fechaInicio:
        new Date().toISOString().split('T')[0]
    };

    this.creditoService.simular(request)
      .subscribe({

        next: (response) => {

          console.log(request)
          console.log(response);

          this.resultado = response;

          this.cronograma =
            response.cronograma;

          this.estimatedMonthlyPayment =
            response.cuotaOrdinaria;

          this.projectedTotalInterest =
            response.totalIntereses;

          this.totalDisbursement =
            response.totalPagado;

          this.appliedRate =
            response.tea * 100;

          this.snackBar.open(
            'Cronograma generado correctamente',
            'Cerrar',
            {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'top'
            }
          );

          this.simulationState.resultado = response;

          this.simulationState.creditoRequest = request;

          console.log(this.simulationState.creditoRequest);

          this.router.navigateByUrl('/QCSFINANCE/pagos');
        },

        error: (error) => {

          console.error(error);

          this.snackBar.open(
            'Error al generar simulación',
            'Cerrar',
            {
              duration: 3000
            }
          );
        }
      });
  }
  saveScenario(): void {

    this.snackBar.open(
      'Funcionalidad pendiente',
      'Cerrar',
      {
        duration: 3000
      }
    );
  }

  private mapGraceType(
    value: string | null | undefined
  ): string {

    switch (value) {

      case 'Total':
        return 'TOTAL';

      case 'Parcial (Solo Interés)':
        return 'PARCIAL';

      default:
        return 'SIN_GRACIA';
    }
  }
}
