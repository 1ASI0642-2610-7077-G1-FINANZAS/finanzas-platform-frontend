// Modelo de Vehículo — debe coincidir con la entidad del backend
export interface Vehiculo {
  idVehiculo?: number;
  marca: string;
  modelo: string;
  anio: number;
  moneda: 'PEN' | 'USD';
  precio: number;
  descripcion?: string;
}

export interface VehiculoFiltros {
  marca: string | 'TODAS';
}
