import { Routes } from '@angular/router';
import {Login} from './components/login/login';
import {Signup} from './components/signup/signup';
import {Simulation} from './components/simulation/simulation';

export const routes: Routes = [
  { path: 'QCSFINANCE/authenticate', component: Login},
  { path: 'QCSFINANCE/user', component: Signup},
  { path: 'QCSFINANCE/simulation', component: Simulation},
];
