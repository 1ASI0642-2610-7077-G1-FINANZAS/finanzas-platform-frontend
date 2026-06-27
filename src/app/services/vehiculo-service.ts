import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Vehiculo } from '../model/vehiculo';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class VehiculoService {
  private http = inject(HttpClient);
  private readonly API = `${environment.apiUrl}/api/vehiculos`;

  listarVehiculos(): Observable<Vehiculo[]> {
    return this.http.get<Vehiculo[]>(this.API);
  }

  obtener(id: number): Observable<Vehiculo> {
    return this.http.get<Vehiculo>(`${this.API}/${id}`);
  }

  crear(v: Vehiculo): Observable<Vehiculo> {
    return this.http.post<Vehiculo>(this.API, v);
  }

  actualizar(id: number, v: Vehiculo): Observable<Vehiculo> {
    return this.http.put<Vehiculo>(`${this.API}/${id}`, v);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }

  // Persistencia del vehículo seleccionado (para que el Simulador lo lea)
  guardarSeleccionado(v: Vehiculo): void {
    localStorage.setItem('vehiculo_seleccionado', JSON.stringify(v));
  }

  obtenerSeleccionado(): Vehiculo | null {
    const raw = localStorage.getItem('vehiculo_seleccionado');
    return raw ? (JSON.parse(raw) as Vehiculo) : null;
  }

  limpiarSeleccion(): void {
    localStorage.removeItem('vehiculo_seleccionado');
  }
}
