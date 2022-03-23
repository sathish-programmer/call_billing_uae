import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserComponent } from '../user/user.component';
import { ManageUserComponent } from '../user/manage-user/manager-user.component';

const routes: Routes = [
  { path: '', component: UserComponent },
  { path: 'manage', component: ManageUserComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
