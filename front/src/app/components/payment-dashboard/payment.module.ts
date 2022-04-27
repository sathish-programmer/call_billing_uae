import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PaymentRoutingModule } from './payment-routing.module';
import { PaymentGraphicalViewComponent } from './payment-graphical-view/payment-graphical-view.component';
import { PaymentBudgetComponent } from './payment-budget/payment-budget.component';


@NgModule({
  declarations: [PaymentGraphicalViewComponent, PaymentBudgetComponent],
  imports: [
    CommonModule,
    PaymentRoutingModule
  ]
})
export class PaymentModule { }
