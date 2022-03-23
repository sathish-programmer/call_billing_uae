import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { ChartsModule } from 'ng2-charts';
import { DpDatePickerModule } from 'ng2-date-picker';
import { ReportsComponent } from './reports/reports.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CallLogsComponent } from './call-logs/call-logs.component';
import { NgxPaginationModule } from 'ngx-pagination';

@NgModule({
  declarations: [DashboardComponent, ReportsComponent, CallLogsComponent],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    ChartsModule,
    DpDatePickerModule,
    ReactiveFormsModule,
    FormsModule,
    NgxPaginationModule
  ]
})
export class DashboardModule { }
