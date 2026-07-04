import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cliente } from '../model/cliente';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ClienteService {
  private http = inject(HttpClient);
  private readonly API = `${environment.apiUrl}/api/clientes`;

  listarClientes(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(this.API);
  }

  obtenerCliente(id: number): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.API}/${id}`);
  }

  crearCliente(c: Cliente): Observable<Cliente> {
    return this.http.post<Cliente>(this.API, c);
  }

  actualizarCliente(id: number, c: Cliente): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.API}/${id}`, c);
  }

  eliminarCliente(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }
}
