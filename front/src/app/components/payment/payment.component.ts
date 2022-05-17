import { PackageMaster } from './../../models/package.model';
import { Organization } from './../../models/organization.model';
import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { Payment } from '../../models/payment.model';
import { AuthService } from '../../auth/auth.service';
import { ToastrService } from 'ngx-toastr';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { OrganizationIdSharingService } from '../../service/data.service';
import { Roles } from '../../models/role.model';
import { Subscription } from 'rxjs';
import { ThrowStmt } from '@angular/compiler';
import { HttpClient, HttpHeaders } from '@angular/common/http';
declare let $: any;

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss'],
})
export class PaymentComponent implements OnInit, OnDestroy {
  orgListSubscriptiion: Subscription;
  addOrgSubscription: Subscription;
  sendOtpPayment: Subscription;
  verifyOtpPayment: Subscription;
  addPackageCredit: Subscription;
  editOrgSubscription: Subscription;
  deletePaymentSubscription: Subscription;
  notifyPaymentExpire: Subscription;
  paymentForm: FormGroup;
  paymentEditForm: FormGroup;
  parentOrgList: Organization[];
  paymentList: any;
  orgChildList: Organization[];
  paymentId: any;
  paymentName: any;
  permissions: [] = [];

  optionSelectedVal: any;

  packListSubscription: Subscription;
  packgList: PackageMaster[];
  payPaginator = { limit: 10, skip: 1, total: 0 };
  timeLeft: number = 60;
  interval;

  newAvailAmountInEdit: any;
  newTotalAmountEdit: any;

  updateAmountEdit: any;

  paymentGoingToExpire: Boolean = false;

  enableAddPackageButton: Boolean = false;

  paymentEmail: any;

  orgAdminEmail: any;

  divTimer: boolean = false;
  divCodeSentTo: boolean = false;

  butSendOtp: boolean = true;
  butVerifyOtp: boolean = false;
  message: boolean = false;

  OrganizationName: any;

  packageDetails: any[];
  constructor(
    private authService: AuthService,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private sharingService: OrganizationIdSharingService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.formInit();
    this.getOrgList(1);
    this.getPaymentOrgList(1);

    this.paymentEmail = localStorage.getItem('email');

    this.orgAdminEmail = this.paymentEmail;

    this.permissions = JSON.parse(localStorage.getItem('permissions'));
    $('#org-dropdown-navbar').prop('disabled', true);
    this.getPackList();
    //   this.packageDetails = [
    //     {
    //       value: '500',
    //       package: 'Package One ( $500 )',
    //     },
    //     {
    //       value: '1000',
    //       package: 'Package Two ( $1000 )',
    //     },
    //   ];
  }

  ngOnDestroy(): void {
    $('#org-dropdown-navbar').prop('disabled', false);
    this.orgListSubscriptiion.unsubscribe();
    this.addOrgSubscription?.unsubscribe();
    this.sendOtpPayment?.unsubscribe();
    this.verifyOtpPayment?.unsubscribe();
    this.addPackageCredit?.unsubscribe();
    this.editOrgSubscription?.unsubscribe();
    this.deletePaymentSubscription?.unsubscribe();
    this.notifyPaymentExpire?.unsubscribe();
    this.packListSubscription?.unsubscribe();
  }

  formInit() {
    this.paymentForm = this.fb.group({
      otp: ['', Validators.required],
      package: ['', Validators.required],
      parent: ['', Validators.required],
    });

    this.paymentEditForm = this.fb.group({
      packageEditName: ['', Validators.required],
      assignedAmount: ['', Validators.required],
      organizationEdit: ['', Validators.required],
      pendingAmount: ['', Validators.required],
    });
  }

  getPackList() {
    this.packListSubscription = this.authService.getPackageList().subscribe(
      (res) => {
        if (res['success']) {
          this.packageDetails = res['data'];
        } else {
          this.toastr.error(res['message'], 'Error!');
        }
      },
      () => {
        this.toastr.error('Something went wrong', 'Error!');
      }
    );
  }

  getPaymentOrgList(skip) {
    this.authService.getPaymentOrgList().subscribe(
      (res) => {
        if (res['success']) {
          this.paymentList = res['data'];
          this.payPaginator.total = res['data'].length;
        } else {
          this.toastr.error(res['message'], 'Error!');
        }
      },
      () => {
        this.toastr.error('Something went wrong', 'Error!');
      }
    );
  }

  getOrgList(skip) {
    console.log('skip', skip);

    this.payPaginator.skip = skip;
    let dataToSend = {
      skip: this.payPaginator.skip,
      limit: this.payPaginator.limit,
    };
    this.orgListSubscriptiion = this.authService
      .getOrganizationList(dataToSend)
      .subscribe(
        (res) => {
          if (res['success']) {
            this.parentOrgList = res['data'];
            this.payPaginator.total = res['total'];
          } else {
            this.toastr.error(res['message'], 'Error!');
          }
        },
        () => {
          this.toastr.error('Something went wrong', 'Error!');
        }
      );
  }

  onOptionsSelected($event) {
    let value = $event.target.value;
    this.updateAmountEdit = value;
    let newFullAmount = parseInt(this.newTotalAmountEdit) + parseInt(value);
    let newAvailAmount = parseInt(this.newAvailAmountInEdit) + parseInt(value);

    $('#avilAmt').val(newFullAmount);
    $('#pendAmt').val(newAvailAmount);
  }

  editPayment(paymentData: Payment) {
    // console.log(paymentData);
    let sendData = { currency: paymentData['currencySymbol'] };
    this.authService.getEditPackageOptions(sendData).subscribe((res) => {
      if (res['success']) {
        console.log(res['data']);
        this.optionSelectedVal = res['data'];
      } else {
        this.toastr.error(res['message'], 'Error!');
      }
    });

    if (paymentData) {
      this.newAvailAmountInEdit = paymentData['availablePackage'];
      this.newTotalAmountEdit = paymentData['package'];
      this.paymentId = paymentData['_id'];
      this.paymentEditForm.patchValue({
        assignedAmount: paymentData['package'],
        pendingAmount: paymentData['availablePackage'],
        organizationEdit: paymentData['orgName'],
      });
      $('#editPaymentModal').modal('show');
    }
  }

  onChangeGetVal($event) {
    let text = $event.target.options[$event.target.options.selectedIndex].text;
    console.log(text);
    this.OrganizationName = text;
  }

  updatePayment() {
    let newAsingVal = $('#avilAmt').val();
    let newPendVal = $('#pendAmt').val();
    this.paymentEditForm.value['assignedAmount'] = newAsingVal;
    this.paymentEditForm.value['pendingAmount'] = newPendVal;
    console.log(this.paymentEditForm.value);
    this.editOrgSubscription = this.authService
      .updatePayment(this.paymentEditForm.value, this.paymentId)
      .subscribe(
        (res) => {
          if (res['success']) {
            this.toastr.success('Payment Updated', 'Success!');
            $('#editPaymentModal').modal('hide');
            this.paymentEditForm.reset();
            this.getPaymentOrgList(1);
            this.changeOrgList();
          } else {
            this.toastr.error(res['message'], 'Error!');
          }
        },
        () => {
          this.toastr.error('Something went wrong', 'Error!');
        }
      );
  }

  deletePaymentIcon(paymentData: Payment) {
    if (paymentData) {
      this.paymentId = paymentData['_id'];
      this.paymentName = paymentData['orgName'];
      $('#deleteModal').modal('show');
    }
  }

  deletePayment() {
    this.deletePaymentSubscription = this.authService
      .deletePayment(this.paymentId)
      .subscribe(
        (res) => {
          if (res['success']) {
            this.toastr.success(res['message'], 'Success!');
            $('#deleteModal').modal('hide');
            this.paymentForm.reset();
            this.getPaymentOrgList(1);
            this.changeOrgList();
          } else {
            this.toastr.error(res['message'], 'Error!');
          }
        },
        () => {
          this.toastr.error('Something went wrong', 'Error!');
        }
      );
  }

  notifyAlertMail(notify: Payment) {
    let orgId = notify['organization'];
    this.notifyPaymentExpire = this.authService
      .notifyPaymentAlertMail(orgId)
      .subscribe(
        (res) => {
          if (res['success']) {
            this.toastr.success(res['message'], 'Success!');
          } else {
            this.toastr.error(res['message'], 'Error!');
          }
        },
        () => {
          this.toastr.error('Something went wrong', 'Error!');
        }
      );
  }

  listChilds(childOrgList: Organization[]) {
    if (childOrgList && childOrgList.length) {
      this.orgChildList = childOrgList;
      $('#orgChildList').modal('show');
    }
  }

  changeOrgList() {
    this.sharingService.changeOrgList(true);
  }

  openPaymentPopUp() {
    this.paymentForm.reset();
    $('#addOrgModal').modal('show');
  }

  verifyOtp() {
    // $('.verify-icon').css('background-size', '15px');
    var otp_value = $('#otp_val').val();
    if (otp_value == '' || otp_value == undefined) {
      this.toastr.error('Please enter OTP', 'Error!');
      return;
    }
    let data = { otp: otp_value };

    this.verifyOtpPayment = this.authService.verifyOtpPayment(data).subscribe(
      (res) => {
        if (res['success']) {
          this.enableAddPackageButton = true;

          $('#addPackBtn').removeAttr('Disabled');

          $('.send-otp-verify-otp').css('padding', '2px 25px 2px 8px');
          $('.send-otp-verify-otp').css('background-size', '12px');
          $('.send-otp-verify-otp').html('OTP Verified');
          // $('.otp-error').css('display', 'none');
          var chk_verifed = $('.send-otp-verify-otp').html();
          if (chk_verifed == 'OTP Verified') {
            $('.send-otp-verify-otp').prop('disabled', true);
            $('.verify-icon').prop('disabled', true);
            $('.verify-icon').css('background-color', '#80808026');
          }

          $('.resend-optSpan').css('display', 'none');
          $('.resend-otp').css('display', 'none');
          this.divTimer = false;
          this.toastr.success(res['message'], 'Success!');
        } else {
          $('#addPackBtn').prop('disabled', true);
          // $('.otp-error').css('display', 'flex');
          // $('.otp-error').html('The code you entered was incorrect');
          this.enableAddPackageButton = false;
          this.toastr.error(res['message'], 'Error!');
        }
      },
      () => {
        this.enableAddPackageButton = false;
        this.toastr.error('Something went wrong', 'Error!');
      }
    );
  }

  resendotp() {
    this.divTimer = true;
    this.divCodeSentTo = true;
    this.butSendOtp = false;
    this.butVerifyOtp = true;
    $('.resend-otp').prop('disabled', true);
    $('.resend-otp').css('opacity', '0.6');
    this.interval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        this.timeLeft = 60;
      }
      if (this.timeLeft == 0) {
        clearInterval(this.interval);
        this.divTimer = false;
        $('.resend-otp').removeAttr('Disabled');
        $('.resend-otp').css('opacity', '1');
      }
    }, 1000);

    // let data = { email: this.orgAdminEmail };
    let mailOrganizationName = this.OrganizationName;
    let data = { email: this.orgAdminEmail, orgName: mailOrganizationName };
    // let data_new = JSON.stringify(data);
    this.sendOtpPayment = this.authService.sendOtpPayment(data).subscribe(
      (res) => {
        if (res['success']) {
          this.toastr.success('OTP resent success', 'Success!');
        } else {
          this.toastr.error(res['message'], 'Error!');
        }
      },
      () => {
        this.toastr.error('Something went wrong', 'Error!');
      }
    );
  }

  sendOtp() {
    this.divTimer = true;
    this.divCodeSentTo = true;
    this.butSendOtp = false;
    this.butVerifyOtp = true;

    this.interval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        this.timeLeft = 60;
      }
      if (this.timeLeft == 0) {
        clearInterval(this.interval);
        this.divTimer = false;
        $('.resend-otp').removeAttr('Disabled');
        $('.resend-otp').css('opacity', '1');
      }
    }, 1000);

    let mailOrganizationName = this.OrganizationName;
    let data = { email: this.orgAdminEmail, orgName: mailOrganizationName };
    // let data_new = JSON.stringify(data);
    // console.log(data_new);
    this.sendOtpPayment = this.authService.sendOtpPayment(data).subscribe(
      (res) => {
        if (res['success']) {
          this.toastr.success(res['message'], 'Success!');
        } else {
          this.toastr.error(res['message'], 'Error!');
        }
      },
      () => {
        this.toastr.error('Something went wrong', 'Error!');
      }
    );
  }

  addPackage() {
    $('.resend-optSpan').css('display', 'inline');
    $('.resend-otp').css('display', 'inline');
    this.timeLeft = 60;
    clearInterval(this.interval);
    console.log(this.paymentForm.value);
    // return;
    this.addPackageCredit = this.authService
      .addPackageCredit(this.paymentForm.value)
      .subscribe(
        (res) => {
          if (res['success'] && res['data'] != 'Id already available') {
            $('#addOrgModal').modal('hide');
            $('.verify-icon').removeAttr('Disabled');
            $('.verify-icon').css('background-color', '#fff');
            this.butSendOtp = true;
            this.butVerifyOtp = false;
            this.paymentForm.reset();
            this.getPaymentOrgList(1);
            this.changeOrgList();
            $('#addPackBtn').prop('disabled', true);
            this.toastr.success(res['message'], 'Success!');
          } else if (res['success'] && res['data'] == 'Id already available') {
            $('#addOrgModal').modal('hide');
            $('.verify-icon').removeAttr('Disabled');
            $('.verify-icon').css('background-color', '#fff');
            this.butSendOtp = true;
            this.butVerifyOtp = false;
            this.paymentForm.reset();
            this.getPaymentOrgList(1);
            this.changeOrgList();
            $('#addPackBtn').prop('disabled', true);
            this.toastr.info(res['message'], 'Info!');
          } else {
            this.toastr.error(res['message'], 'Error!');
          }
        },
        () => {
          this.toastr.error('Something went wrong', 'Error!');
        }
      );
  }
}
