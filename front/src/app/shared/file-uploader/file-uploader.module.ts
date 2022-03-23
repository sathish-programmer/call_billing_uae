import { NgModule } from "@angular/core";
import { CommonModule } from '@angular/common';
import { UploadImagePdfNoCrop } from './file-uploader';

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [ UploadImagePdfNoCrop ],
    exports: [ UploadImagePdfNoCrop ]
})

export class UploadImagePdfNoModule {}