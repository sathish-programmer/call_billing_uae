import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RoleComponent } from '../role/role.component';
import { ManageRoleComponent } from '../role/manage-role/manage-role.component';
const routes: Routes = [
  { path: '', component: RoleComponent},
  { path: 'manage', component: ManageRoleComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RoleRoutingModule { }
