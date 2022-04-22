import 'reflect-metadata';
import {
  Component,
  ElementRef,
  NgZone,
  Output,
  EventEmitter,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/auth/auth.service';
declare let $: any;

@Component({
  selector: 'file-uploader',
  templateUrl: 'file-uploader.html',
})
export class UploadImagePdfNoCrop {
  image: any;
  status: String = 'Upload';
  isUploading: boolean = false;
  fileSelected: boolean = false;
  hideAtPath = false;
  org: any;
  @Output() uploadedImageUrl = new EventEmitter<Object>();

  constructor(
    private element: ElementRef,
    private _zone: NgZone,
    public _params: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private authService: AuthService
  ) {
    this.org = localStorage.getItem('organization');
  }

  changeListner(event) {
    if (!event.target.files[0].name.match(/\.(csv|CSV)$/)) {
      // this.toastr.error('File format not supported. Please select a valid image or PDF/Doc file.');
      this.toastr.error(
        'File format not supported. Please select a valid CSV file.'
      );
      return;
    }

    var reader = new FileReader();
    var image = this.element.nativeElement.querySelector('.image');
    var src;
    reader.onload = function (e) {
      src = e.target.result;
      // image.src = src;
    };
    reader.readAsDataURL(event.target.files[0]);
    this.fileSelected = true;
    this.isUploading = false;
    this.status = 'Upload';
  }

  save() {
    let fileUploaded: any = document.getElementById(
      'imk_inputFileFromUploadImageModal_nocrop'
    );
    var originalFile = fileUploaded.files[0];
    if (!originalFile) {
      return;
    }

    // if (!originalFile.name.match(/.*\.(xlsx|xls|csv)/g)){
    if (!originalFile.name.match(/\.(csv|CSV)$/)) {
      // this.toastr.error('File format not supported. Please select a valid image or PDF/Doc file.');
      this.toastr.error(
        'File format not supported. Please select a valid image or CSV file.'
      );
      return;
    }

    this.isUploading = true;
    this.status = 'Uploading file..';
    var re = /(?:\.([^.]+))?$/;

    var ext = re.exec(originalFile.name)[1];

    this._zone.run(() => {
      let formdata = new FormData();
      formdata.append('file', originalFile);
      formdata.append('name', originalFile.name);
      formdata.append('type', originalFile.type);
      formdata.append('extension', ext);
      formdata.append('organization', this.org);
      this.authService.saveTariffFile(formdata).subscribe(
        (res) => {
          this.isUploading = false;
          this.status = 'Upload';
          this.fileSelected = false;
          fileUploaded = '';
          if (res['success']) {
            var files = {
              originalFileType: originalFile.type,
              name: originalFile.name,
              originalFileExtension: ext,
              originalFile: originalFile,
              originalId: res['data'],
            };
            this.uploadedImageUrl.emit(files);
          } else {
            this.toastr.error(res['message'], 'Error!');
          }
        },
        () => {
          this.isUploading = false;
          fileUploaded = '';
          this.status = 'Upload';
          this.fileSelected = false;
          this.toastr.error('Something went wrong', 'Error!');
        }
      );
    });
  }
}
