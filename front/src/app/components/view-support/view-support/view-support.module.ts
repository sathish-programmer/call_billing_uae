import { NgxPaginationModule } from 'ngx-pagination';
import { NgModule , CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import { CommonModule } from '@angular/common';

import { HttpClientModule } from '@angular/common/http';
import { ViewSupportRoutingModule } from './view-support-routing.module';
import { ViewSupportComponent } from './../view-support.component';
import { ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [ViewSupportComponent],
  imports: [
    CommonModule,
    ViewSupportRoutingModule,
    HttpClientModule,
    NgxPaginationModule,
    ReactiveFormsModule
  ]
})
export class ViewSupportModule { }
