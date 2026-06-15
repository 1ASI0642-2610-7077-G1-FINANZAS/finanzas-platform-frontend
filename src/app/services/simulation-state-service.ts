import {Injectable, Service} from '@angular/core';
import {ResultadoCalculo} from '../model/resultado-calculo';

@Injectable({
  providedIn: 'root'
})
export class SimulationStateService {

  resultado?: ResultadoCalculo;

}
