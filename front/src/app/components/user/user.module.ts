import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserRoutingModule } from './user-routing.module';
import { UserComponent } from './user.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ManageUserComponent } from './manage-user/manager-user.component';
import { NgxPaginationModule } from 'ngx-pagination';


@NgModule({
  declarations: [UserComponent, ManageUserComponent],
  imports: [
    CommonModule,
    UserRoutingModule,
    ReactiveFormsModule,
    NgxPaginationModule
  ]
})
export class UserModule { }
