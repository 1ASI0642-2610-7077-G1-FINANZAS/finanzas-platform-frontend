import {inject, Injectable, Service} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ClienteRequest} from '../model/cliente-request';
import {Observable} from 'rxjs';
import {Cliente} from '../model/cliente';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {

  private http = inject(HttpClient);

  private apiUrl =environment.apiUrl + '/api/clientes';

  crearCliente(
    cliente: ClienteRequest
  ): Observable<any> {
    return this.http.post(this.apiUrl, cliente);
  }

  listarClientes(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(this.apiUrl);
  }
}
