export class CronogramaFila {
  numeroCuota: number;
  tipoPeriodo: string;
  fechaPago: string;

  // --- SECCIÓN BALLOON (CUOTA FINAL) ---
  balloonSaldoInicial: number;
  balloonInteres: number;
  balloonAmortizacion: number;
  balloonSeguro: number;
  balloonSaldoFinal: number;

  // --- SECCIÓN REGULAR ---
  regularSaldoInicial: number;
  regularInteres: number;
  regularCuotaTotal: number;
  regularAmortizacion: number;
  regularSeguro: number;
  regularRiesgo: number;
  regularGps: number;
  regularPortes: number;
  regularGastos: number;
  regularSaldoFinal: number;

  // --- FLUJO TOTAL ---
  flujo: number;
}
