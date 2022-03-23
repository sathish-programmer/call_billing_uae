import { SubscriptionComponent } from './../../subscription/subscription.component';
import { ViewSupportComponent } from './../../view-support/view-support.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { CallLogsComponent } from './call-logs/call-logs.component';
import { ReportsComponent } from './reports/reports.component';
import { SupportComponent  } from '../../support/support.component';

const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'reports', component: ReportsComponent },
  { path: 'call-logs', component: CallLogsComponent },
  { path: 'support', component: SupportComponent },
  { path: 'tickets', component:ViewSupportComponent},
  { path: 'subscription', component:SubscriptionComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
