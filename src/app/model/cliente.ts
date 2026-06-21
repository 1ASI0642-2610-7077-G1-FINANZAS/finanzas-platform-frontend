export interface Cliente {
  idCliente?: number;
  nombres: string;
  apellidos: string;
  tipoDocumento: string;
  numeroDocumento: string;
  correo?: string;
  telefono?: string;
  direccion?: string;
}
