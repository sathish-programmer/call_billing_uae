import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ManageProviderComponent } from './manage-provider/manage-provider.component';
import { ManageTariffComponent } from './manage-tariff/manage-tariff.component';
import { SetupComponent } from './setup.component';

const routes: Routes = [
  { path: '', component: SetupComponent} ,
  { path:'manage-provider', component: ManageProviderComponent},
  { path:'manage-tariff', component: ManageTariffComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SetupRoutingModule { }
