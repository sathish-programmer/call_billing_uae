import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from './auth/auth.service';
import { AuthGuard } from './auth/auth.guard';
import { LoginGuard } from './auth/login.guard';
import { ToastrModule } from 'ngx-toastr';
import { NgxUiLoaderModule } from 'ngx-ui-loader';
import { SupportComponent } from './components/support/support.component';
import { ViewSupportComponent } from './components/view-support/view-support.component';
import { NgxPaginationModule, PaginatePipe } from 'ngx-pagination';
import { DpDatePickerModule } from 'ng2-date-picker';
import { SubscriptionComponent } from './components/subscription/subscription.component';
import { PaymentComponent } from './components/payment/payment.component';
import { PaymentDashboardComponent } from './components/payment-dashboard/payment-dashboard.component';
import { PaymentMasterComponent } from './components/payment-master/payment-master.component';
@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SupportComponent,
    ViewSupportComponent,
    SubscriptionComponent,
    PaymentComponent,
    PaymentDashboardComponent,
    PaymentMasterComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    NgxUiLoaderModule,
    NgxPaginationModule,
    DpDatePickerModule,
    ToastrModule.forRoot({
      timeOut: 10000,
      positionClass: 'toast-bottom-center',
      preventDuplicates: true,
      closeButton: true
    }),
  ],
  providers: [AuthService, AuthGuard, LoginGuard],
  bootstrap: [AppComponent]
})
export class AppModule { }
