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
  expiredTemplate: FormGroup;
  saveTemp: Subscription;
  getTemp: Subscription;

  saveExpireTemp: Subscription;
  saveExpiredTemp: Subscription;
  getExpireTemp: Subscription;

  getExpiredTemp: Subscription;

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

  subject2: any;
  title2: any;
  body2: any;
  signature2: any;

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
    this.getExpiredEmailTemp();
  }

  ngOnDestroy(): void {
    this.saveTemp?.unsubscribe();
    this.getTemp?.unsubscribe();

    this.saveExpireTemp?.unsubscribe();
    this.getExpireTemp?.unsubscribe();
    this.getExpiredTemp?.unsubscribe();
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

    this.expiredTemplate = this.fb.group({
      // to: ['', Validators.required],
      subject2: ['', Validators.required],
      name2: ['', Validators.required],
      body2: ['', Validators.required],
      signature2: ['', Validators.required],
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
        }
      });
  }

  getExpiredEmailTemp() {
    this.getExpiredTemp = this.authService
      .getExpiredTempRec()
      .subscribe((res) => {
        if (res['success']) {
          let data = res['data'];
          console.log('cjedsdd', data);
          this.title2 = data.title;
          this.subject2 = data.subject;
          this.body2 = data.body.replace('</b>', '\n');
          console.log(this.body2);
          this.signature2 = data.signature.replace('</b>', '\n');
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
    this.saveExpireTemp = this.authService.setExpireTemp(data).subscribe(
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

  setExpiredTemp(formValue) {
    if (formValue.name2 == '') {
      formValue['name2'] = this.title2;
    }
    if (formValue.body2 == '') {
      formValue['body2'] = this.body2;
    }
    if (formValue.subject2 == '') {
      formValue['subject2'] = this.subject2;
    }
    if (formValue.signature2 == '') {
      formValue['signature2'] = this.signature2;
    }

    let data = {
      subject: formValue['subject2'],
      name: formValue['name2'],
      body: formValue['body2'],
      signature: formValue['signature2'],
    };

    let subj = $('#subject2').val();
    let body = $('#body2').val();
    let title = $('#title2').val();
    let sign = $('#sign2').val();
    if (subj == '' || body == '' || title == '' || sign == '') {
      alert('Please enter required fields');
      return;
    }
    this.saveExpiredTemp = this.authService.setExpiredTemp(data).subscribe(
      (res) => {
        if (res['success']) {
          console.log(res['data']);
          this.getExpireEmailTemp();
          this.toastr.success(res['message'], 'Success!');
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
