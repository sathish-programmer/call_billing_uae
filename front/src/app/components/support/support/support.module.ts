import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SupportRoutingModule } from './support-routing.module';
import { SupportComponent } from '../support.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ViewSupportComponent } from './../../view-support/view-support.component';
import { DpDatePickerModule } from 'ng2-date-picker';
@NgModule({
  declarations: [SupportComponent],
  imports: [
    CommonModule,
    SupportRoutingModule,
    SupportComponent,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    ViewSupportComponent,
    DpDatePickerModule
  ]
})
export class SupportModule { }
