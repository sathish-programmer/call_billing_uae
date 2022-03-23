import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LandingComponent } from './landing.component';

const routes: Routes = [
  {
    path: '',
    component: LandingComponent,
    children: [
      { path: 'organization', loadChildren: () => import("../components/organization/organization.module").then(m => m.OrganizationModule) },
      { path: 'department', loadChildren: () => import("../components/department/department.module").then(m => m.DepartmentModule) },
      { path: 'branch', loadChildren: () => import("../components/branch/branch.module").then(m => m.BranchModule) },
      { path: 'role', loadChildren: () => import("../components/role/role.module").then(m => m.RoleModule) },
      { path: 'user', loadChildren: () => import("../components/user/user.module").then(m => m.UserModule) },
      { path: 'sub-department', loadChildren: () => import("../components/sub-department/sub-department.module").then(m => m.SubDepartmentModule) },
      { path: 'inaipi/setup', loadChildren: () => import("../components/INAIPI/setup/setup.module").then(m => m.SetupModule) },
      { path: 'inaipi/dashboard', loadChildren: () => import("../components/INAIPI/dashboard/dashboard.module").then(m => m.DashboardModule) },
      { path: '', redirectTo: 'inaipi/dashboard' },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LandingRoutingModule { }
