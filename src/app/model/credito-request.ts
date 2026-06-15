export class CreditoRequest {
  idCliente: number;
  idVehiculo: number;

  moneda: string;
  tipoTasa: string;
  tasaInteres: number;
  frecuenciaCapitalizacion?: string;

  plazoMeses: number;

  tipoGracia: string;
  periodoGracia: number;

  precioVehiculo: number;
  cuotaInicial: number;
  valorResidual: number;

  seguroDesgravamen: number;
  seguroVehicular: number;
  portes: number;

  fechaInicio: string;
}
