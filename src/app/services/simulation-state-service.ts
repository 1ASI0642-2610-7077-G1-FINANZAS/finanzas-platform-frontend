import { Injectable } from '@angular/core';
import { ResultadoCalculo } from '../model/resultado-calculo';
import { CreditoRequest } from '../model/credito-request';

@Injectable({
  providedIn: 'root',
})
export class SimulationStateService {
  resultado?: ResultadoCalculo;

  creditoRequest?: CreditoRequest;
}
