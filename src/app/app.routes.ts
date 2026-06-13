import { Routes } from '@angular/router';
import {Login} from './components/login/login';
import {Signup} from './components/signup/signup';
import {Simulation} from './components/simulation/simulation';
import {Pagos} from './components/pagos/pagos';
import {RegCliente} from './components/reg-cliente/reg-cliente';
import { Vehiculo } from './components/vehiculo/vehiculo';

export const routes: Routes = [
  { path: 'QCSFINANCE/authenticate', component: Login},
  { path: 'QCSFINANCE/user', component: Signup},
  { path: 'QCSFINANCE/simulation', component: Simulation},
  { path: 'QCSFINANCE/pagos', component: Pagos},
  { path: 'QCSFINANCE/registro_cliente', component: RegCliente},
  {path: 'QCSFINANCE/seleccion_vehiculo', component: Vehiculo},
];
