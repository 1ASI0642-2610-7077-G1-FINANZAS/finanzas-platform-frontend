import {inject, Service} from '@angular/core';
import {environment} from '../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Vehiculo} from '../model/vehiculo';

@Service()
export class VehiculoService {
  private readonly apiUrl = `${environment.apiUrl}/api/vehiculos`;

  private http = inject(HttpClient);

  listarVehiculos(): Observable<Vehiculo[]> {
    return this.http.get<Vehiculo[]>(this.apiUrl);
  }

}
