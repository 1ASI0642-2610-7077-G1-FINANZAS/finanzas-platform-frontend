import {inject, Injectable, Service} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ClienteRequest} from '../model/cliente-request';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {

  private http = inject(HttpClient);

  private apiUrl =
    'http://localhost:8080/api/clientes';

  crearCliente(
    cliente: ClienteRequest
  ): Observable<any> {
    return this.http.post(this.apiUrl, cliente);
  }
}
