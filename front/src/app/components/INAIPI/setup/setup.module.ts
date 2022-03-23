import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SetupRoutingModule } from './setup-routing.module';
import { SetupComponent } from './setup.component';
import { ManageProviderComponent } from './manage-provider/manage-provider.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UploadImagePdfNoCrop } from "../../../shared/file-uploader/file-uploader";
import { NgxPaginationModule } from 'ngx-pagination';
import { ManageTariffComponent } from './manage-tariff/manage-tariff.component';
import { A2Edatetimepicker } from 'ng2-eonasdan-datetimepicker';
import { DpDatePickerModule } from 'ng2-date-picker';

@NgModule({
  declarations: [SetupComponent, ManageProviderComponent, UploadImagePdfNoCrop, ManageTariffComponent],
  imports: [
    CommonModule,
    SetupRoutingModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    A2Edatetimepicker,
    FormsModule,
    DpDatePickerModule
  ]
})
export class SetupModule { }
