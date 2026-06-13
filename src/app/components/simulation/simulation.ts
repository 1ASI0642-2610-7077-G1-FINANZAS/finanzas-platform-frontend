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
    MatSnackBarModule
  ],
  templateUrl: './simulation.html',
  styleUrl: './simulation.css',
})
export class Simulation {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly snackBar = inject(MatSnackBar);

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

  estimatedMonthlyPayment = 1624.85;
  financedCapital = 45000.00;
  projectedTotalInterest = 13494.60;
  gracePeriodAccumulation = 1087.50;
  totalDisbursement = 58494.60;
  appliedRate = 14.50;

  ngOnInit(): void {
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

    this.simulationForm.valueChanges.subscribe(() => {
      if (this.simulationForm.valid) {
        this.recalculateProjections();
      }
    });
  }

  private recalculateProjections(): void {
    const rawAmount = this.simulationForm.get('amount')?.value ?? 0;
    this.financedCapital = rawAmount;
    this.appliedRate = this.simulationForm.get('rateValue')?.value ?? 0;

    this.projectedTotalInterest = Number((this.financedCapital * (this.appliedRate / 100) * 2.068).toFixed(2));
    this.gracePeriodAccumulation = Number((this.financedCapital * 0.02416).toFixed(2));
    this.totalDisbursement = Number((this.financedCapital + this.projectedTotalInterest).toFixed(2));
    this.estimatedMonthlyPayment = Number((this.totalDisbursement / (this.simulationForm.get('totalMonths')?.value ?? 36)).toFixed(2));
  }

  generateAmortization(): void {
    if (this.simulationForm.valid) {
      this.snackBar.open('Cronograma de amortización generado con éxito', 'Cerrar', {
        duration: 4000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['success-snackbar']
      });
    }
  }

  saveScenario(): void {
    if (this.simulationForm.valid) {
      this.snackBar.open('Escenario de simulación guardado correctamente', 'Cerrar', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['success-snackbar']
      });
    }
  }
}
