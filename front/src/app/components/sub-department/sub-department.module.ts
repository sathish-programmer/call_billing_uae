import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SubDepartmentRoutingModule } from './sub-department-routing.module';
import { SubDepartmentComponent } from './sub-department.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';

@NgModule({
  declarations: [SubDepartmentComponent],
  imports: [
    CommonModule,
    SubDepartmentRoutingModule,
    ReactiveFormsModule,
    NgxPaginationModule
  ]
})
export class SubDepartmentModule { }
