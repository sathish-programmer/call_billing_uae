import { Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/auth/auth.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

declare let $: any;
@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  otpTemplate: FormGroup;
  expireTemplate: FormGroup;
  saveTemp: Subscription;
  getTemp: Subscription;

  saveExpireTemp: Subscription;
  getExpireTemp: Subscription;

  showData: any;

  toAddress: any;
  subject: any;
  title: any;
  body: any;
  signature: any;

  subject1: any;
  title1: any;
  body1: any;
  signature1: any;

  constructor(
    private authService: AuthService,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.formInit();
    this.getOTPTemp();
    this.getExpireEmailTemp();
  }

  ngOnDestroy(): void {
    this.saveTemp?.unsubscribe();
    this.getTemp?.unsubscribe();

    this.saveExpireTemp?.unsubscribe();
    this.getExpireTemp?.unsubscribe();
  }

  formInit() {
    this.otpTemplate = this.fb.group({
      to: ['', Validators.required],
      subject: ['', Validators.required],
      name: ['', Validators.required],
      body: ['', Validators.required],
      signature: ['', Validators.required],
    });

    this.expireTemplate = this.fb.group({
      // to: ['', Validators.required],
      subject1: ['', Validators.required],
      name1: ['', Validators.required],
      body1: ['', Validators.required],
      signature1: ['', Validators.required],
    });
  }

  getOTPTemp() {
    this.getTemp = this.authService.getOTPTempRec().subscribe((res) => {
      if (res['success']) {
        let data = res['data'];
        this.toAddress = data.to;
        this.title = data.title;
        this.subject = data.subject;
        this.body = data.body.replace('</b>', '\n');
        this.signature = data.signature.replace('</b>', '\n');
        // this.signature.replaceAll('<br>', '\n');
        console.log(this.showData);
        // this.toastr.success('OTP Template Saved', 'Success!');
      }
    });
  }

  getExpireEmailTemp() {
    this.getExpireTemp = this.authService
      .getExpireTempRec()
      .subscribe((res) => {
        if (res['success']) {
          let data = res['data'];
          this.title1 = data.title;
          this.subject1 = data.subject;
          this.body1 = data.body.replace('</b>', '\n');
          this.signature1 = data.signature.replace('</b>', '\n');
          // this.signature.replaceAll('<br>', '\n');
          console.log(this.showData);
          // this.toastr.success('OTP Template Saved', 'Success!');
        }
      });
  }

  setOTPTemp(formValue) {
    if (formValue.to == '') {
      formValue['to'] = this.toAddress;
    }
    if (formValue.name == '') {
      formValue['name'] = this.title;
    }
    if (formValue.body == '') {
      formValue['body'] = this.body;
    }
    if (formValue.subject == '') {
      formValue['subject'] = this.subject;
    }
    if (formValue.signature == '') {
      formValue['signature'] = this.signature;
    }

    let to_email = $('#to_email').val();
    let subj = $('#subject').val();
    let body = $('#body').val();
    let title = $('#title').val();
    let sign = $('#sign').val();
    if (
      to_email == '' ||
      subj == '' ||
      body == '' ||
      title == '' ||
      sign == ''
    ) {
      alert('Please enter required fields');
      return;
    }
    // console.log(formValue);
    // return;
    this.saveTemp = this.authService.setOTPTemp(formValue).subscribe(
      (res) => {
        if (res['success']) {
          console.log(res['data']);
          this.getOTPTemp();
          this.toastr.success(res['message'], 'Success!');
          // this.clearPacktForm();
          // this.getPackList(this.packPaginator.skip);
        } else {
          // this.clearPacktForm();
          this.toastr.error(res['message'], 'Error!');
        }
      },
      () => {
        // this.clearPacktForm();
        this.toastr.error('Something went wrong', 'Error!');
      }
    );
  }

  setExpireTemp(formValue) {
    if (formValue.name1 == '') {
      formValue['name1'] = this.title1;
    }
    if (formValue.body1 == '') {
      formValue['body1'] = this.body1;
    }
    if (formValue.subject1 == '') {
      formValue['subject1'] = this.subject1;
    }
    if (formValue.signature1 == '') {
      formValue['signature1'] = this.signature1;
    }

    let data = {
      subject: formValue['subject1'],
      name: formValue['name1'],
      body: formValue['body1'],
      signature: formValue['signature1'],
    };

    // let to_email = $('#to_email').val();
    let subj = $('#subject1').val();
    let body = $('#body1').val();
    let title = $('#title1').val();
    let sign = $('#sign1').val();
    if (subj == '' || body == '' || title == '' || sign == '') {
      alert('Please enter required fields');
      return;
    }
    // console.log(formValue);
    // return;
    this.saveTemp = this.authService.setExpireTemp(data).subscribe(
      (res) => {
        if (res['success']) {
          console.log(res['data']);
          this.getExpireEmailTemp();
          this.toastr.success(res['message'], 'Success!');
          // this.clearPacktForm();
          // this.getPackList(this.packPaginator.skip);
        } else {
          // this.clearPacktForm();
          this.toastr.error(res['message'], 'Error!');
        }
      },
      () => {
        // this.clearPacktForm();
        this.toastr.error('Something went wrong', 'Error!');
      }
    );
  }

  clearFormOtp() {
    this.otpTemplate.reset();
  }
}
