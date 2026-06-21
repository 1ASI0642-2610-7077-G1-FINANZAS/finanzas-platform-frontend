import {inject, Injectable, Service} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {CreditoRequest} from '../model/credito-request';
import {Observable} from 'rxjs';
import {ResultadoCalculo} from '../model/resultado-calculo';

@Injectable({
  providedIn: 'root'
})
export class CreditoService {

  private readonly http = inject(HttpClient);

  private readonly url =
    `${environment.apiUrl}/api/creditos`;

  simular(
    request: CreditoRequest
  ): Observable<ResultadoCalculo> {

    return this.http.post<ResultadoCalculo>(
      `${this.url}/simular`,
      request
    );
  }

  crearCredito(request: CreditoRequest): Observable<any> {
    return this.http.post<any>(
      `${this.url}`,
      request
    );
  }


}
