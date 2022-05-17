import { SettingsModule } from './../components/settings/settings.module';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LandingComponent } from './landing.component';

const routes: Routes = [
  {
    path: '',
    component: LandingComponent,
    children: [
      {
        path: 'organization',
        loadChildren: () =>
          import('../components/organization/organization.module').then(
            (m) => m.OrganizationModule
          ),
      },
      {
        path: 'department',
        loadChildren: () =>
          import('../components/department/department.module').then(
            (m) => m.DepartmentModule
          ),
      },
      {
        path: 'branch',
        loadChildren: () =>
          import('../components/branch/branch.module').then(
            (m) => m.BranchModule
          ),
      },
      {
        path: 'role',
        loadChildren: () =>
          import('../components/role/role.module').then((m) => m.RoleModule),
      },
      {
        path: 'user',
        loadChildren: () =>
          import('../components/user/user.module').then((m) => m.UserModule),
      },
      {
        path: 'sub-department',
        loadChildren: () =>
          import('../components/sub-department/sub-department.module').then(
            (m) => m.SubDepartmentModule
          ),
      },
      {
        path: 'payment',
        loadChildren: () =>
          import('../components/payment/payment.module').then(
            (m) => m.PaymentModule
          ),
      },
      {
        path: 'payment-dashboard',
        loadChildren: () =>
          import('../components/payment-dashboard/payment.module').then(
            (m) => m.PaymentModule
          ),
      },
      {
        path: 'settings',
        loadChildren: () =>
          import('../components/settings/settings.module').then(
            (m) => m.SettingsModule
          ),
      },
      {
        path: 'payment-dashboard/graph-view',
        loadChildren: () =>
          import(
            '../components/payment-dashboard/payment-graphical-view/payment-graphical-view.module'
          ).then((m) => m.PaymentGraphicalViewModule),
      },
      {
        path: 'payment-dashboard/budgets',
        loadChildren: () =>
          import(
            '../components/payment-dashboard/payment-budget/payment-budget.module'
          ).then((m) => m.PaymentBudgetModule),
      },
      {
        path: 'payment-master',
        loadChildren: () =>
          import('../components/payment-master/payment-master.module').then(
            (m) => m.PaymentMasterModule
          ),
      },
      {
        path: 'inaipi/setup',
        loadChildren: () =>
          import('../components/INAIPI/setup/setup.module').then(
            (m) => m.SetupModule
          ),
      },
      {
        path: 'inaipi/dashboard',
        loadChildren: () =>
          import('../components/INAIPI/dashboard/dashboard.module').then(
            (m) => m.DashboardModule
          ),
      },
      { path: '', redirectTo: 'inaipi/dashboard' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LandingRoutingModule {}
