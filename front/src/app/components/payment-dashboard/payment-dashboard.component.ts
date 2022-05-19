import { NgxUiLoaderService } from 'ngx-ui-loader';
import { data } from 'jquery';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../auth/auth.service';
import { Component, OnInit, NgZone } from '@angular/core';
import { environment } from 'src/environments/environment';
import * as moment from 'moment';
import * as _ from 'underscore';

declare var bootstrap: any;

@Component({
  selector: 'app-payment-dashboard',
  templateUrl: './payment-dashboard.component.html',
  styleUrls: ['./payment-dashboard.component.scss'],
})
export class PaymentDashboardComponent implements OnInit {
  getPaymentHistory: any;
  getDataByDate: any;
  getFiveMonthData: any;
  lastPaidAmount: any;
  lastPaidDate: any;
  // allPayData: any;
  allPayData: Array<any> = [];
  availableAmount: any;
  downloadCostReport: any;
  currentDate: any;
  thisMonthStartDate: any;
  forecastTotal: any;

  monthToDayData: number;
  fiveMonthDate: number;
  calcBetweenDays: number;

  showcurrentMnthData: any;
  showPreviousMnthData: any;
  showPreviousMnthDataOne: any;
  showPreviousMnthDataTwo: any;
  showPreviousMnthDataThree: any;

  showTransMsg: boolean;

  showFirstMonthPdf: Boolean = false;
  showSecMonthPdf: Boolean = false;
  showThirdMonthPdf: Boolean = false;
  showFourthMonthPdf: Boolean = false;
  showFivthtMonthPdf: Boolean = false;

  showTransactionNotFound: Boolean = false;

  checkPayHistory: Boolean = false;
  currencySymbol: any;

  startDate: any;
  endDate: any;

  currentMonthDay: any;
  currentMonthToday: any;

  pdfGenerateForm: FormGroup;

  validationMaxDate = moment();
  config = {
    max: this.validationMaxDate,
  };

  showDates = {};

  constructor(
    private authService: AuthService,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private http: HttpClient,
    private _zone: NgZone,
    private ngxLoader: NgxUiLoaderService
  ) {}

  dateRangeType = [
    {
      view: 'Today',
      value: {
        startDate: moment().startOf('day'),
        endDate: moment(),
      },
    },
    {
      view: 'Yesterday',
      value: {
        startDate: moment().subtract(1, 'days').startOf('day'),
        endDate: moment().subtract(1, 'days').endOf('day'),
      },
    },
    {
      view: 'Last Week',
      value: {
        startDate: moment().subtract(1, 'weeks').startOf('week'),
        endDate: moment().subtract(1, 'weeks').endOf('week'),
      },
    },
    {
      view: 'Last Month',
      value: {
        startDate: moment().subtract(1, 'months').startOf('month'),
        endDate: moment().subtract(1, 'months').endOf('month'),
      },
    },
    {
      view: 'Last Year',
      value: {
        startDate: moment().subtract(1, 'years').startOf('year'),
        endDate: moment().subtract(1, 'years').endOf('year'),
      },
    },
    {
      view: 'Month to Date',
      value: {
        startDate: moment().startOf('month'),
        endDate: moment(),
      },
    },
    {
      view: 'Year to Date',
      value: {
        startDate: moment().startOf('year'),
        endDate: moment(),
      },
    },
  ];

  startDateChange(event) {
    this._zone.run(() => {
      this.startDate = moment(event._d);
      console.log('start date', this.startDate);
      this.pdfGenerateForm.patchValue({ startDate: this.startDate });
    });
  }

  endDateChange(event) {
    this._zone.run(() => {
      this.endDate = moment(event._d);
      // console.log(event._d);
      console.log('end date', this.endDate);
      this.pdfGenerateForm.patchValue({ endDate: this.endDate });
    });
  }

  baseUrl = environment.urlForFileDownload;
  ngOnInit(): void {
    var tooltipTriggerList = [].slice.call(
      document.querySelectorAll('[data-bs-toggle="tooltip"]')
    );
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    this.formInit();
    this.getAllPayHistory();
    this.getDatasByDate();
    this.getFiveMonthRecord();
    let currentDate = new Date();
    let firstDay = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );

    this.currentMonthDay = firstDay;
    this.currentMonthToday = currentDate;

    this.currentDate = currentDate;
    this.thisMonthStartDate = firstDay;
    var oneDay = 24 * 60 * 60 * 1000;
    var diffDays = Math.round(
      Math.abs((this.thisMonthStartDate - this.currentDate) / oneDay)
    );
    this.calcBetweenDays = diffDays;
  }
  formInit() {
    this.pdfGenerateForm = this.fb.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
    });
  }

  getFiveMonthRecord() {
    let data = localStorage.getItem('organization');
    this.getFiveMonthData = this.authService.getFiveMonthData(data).subscribe(
      (res) => {
        let data = res['data'];
        this.allPayData = data;

        if (res['data']['currentMonth']['costPaid'] > 0) {
          this.showFirstMonthPdf = true;
          this.showcurrentMnthData = res['data']['currentMonth'];
        }
        if (res['data']['previousMonth']['costPaid'] > 0) {
          this.showSecMonthPdf = true;
          this.showPreviousMnthData = data['previousMonth'];
        }
        if (res['data']['thirdPreviousMonth']['costPaid'] > 0) {
          this.showThirdMonthPdf = true;
          this.showPreviousMnthDataOne = data['thirdPreviousMonth'];
        }
        if (res['data']['fourthPreviousMonth']['costPaid'] > 0) {
          this.showFourthMonthPdf = true;
          this.showPreviousMnthDataTwo = data['fourthPreviousMonth'];
        }
        if (res['data']['fifthPreviousMonth']['costPaid'] > 0) {
          this.showFivthtMonthPdf = true;
          this.showPreviousMnthDataThree = data['fifthPreviousMonth'];
        }
      },
      () => {
        this.toastr.error('Something went wrong', 'Error!');
      }
    );
  }

  getDatasByDate() {
    let data = localStorage.getItem('organization');
    this.getDataByDate = this.authService.getDataByDate(data).subscribe(
      (res) => {
        let data = res['data'];
        this.currencySymbol = res['currencySymbol'];
        this.monthToDayData = data['totalMonthPeroid'].toFixed(2);
        this.forecastTotal = (
          (this.monthToDayData * 30) /
          this.calcBetweenDays
        ).toFixed(2);

        console.log('total amount', res['data']);
      },
      () => {
        this.toastr.error('Something went wrong', 'Error!');
      }
    );
  }

  viewReport() {
    $('#pills-profile-tab').attr('aria-selected', 'true');
    $('#pills-home-tab').attr('aria-selected', 'false');
    $('#pills-profile-tab').attr('class', 'nav-link active');
    $('#pills-home-tab').attr('class', 'nav-link');
  }

  getAllPayHistory() {
    this.availableAmount = localStorage.getItem('pendingAmount');
    let data = localStorage.getItem('organization');
    this.getPaymentHistory = this.authService.getPaymentHistory(data).subscribe(
      (res) => {
        let data = res['data'];
        let recordLength = data.length;

        console.log('length date', recordLength);
        if (recordLength == 0) {
          this.lastPaidAmount = 0;
          // this.lastPaidDate = 0;
          // this.availableAmount = localStorage.getItem('pendingAmount');
          this.showTransactionNotFound = true;
          this.showTransMsg = true;
          this.toastr.info('No transaction found', 'Info!');
        } else {
          this.checkPayHistory = false;
          // this.allPayData = data;
          this.lastPaidAmount = data[0]['calculatedCost'];
          this.lastPaidDate = data[0]['creationDate'];
          // this.availableAmount = data[0]['availablePackage'];
          console.log(res['data']);
        }
      },
      () => {
        this.toastr.error('Something went wrong', 'Error!');
      }
    );
    // console.log(this.availableAmount, 'hiii');
  }

  pdfGenerateByDate(formValue) {
    this.ngxLoader.start();
    formValue.orgId = localStorage.getItem('organization');

    this.downloadCostReport = this.authService
      .downloadCostReport(formValue)
      .subscribe(
        (res) => {
          if (res['success']) {
            console.log(this.baseUrl);
            let fileUrl = this.baseUrl + res['pdfUrl'];
            setTimeout(() => {
              window.open(fileUrl);
              this.ngxLoader.stop();
            }, 5000);
            // this.toastr.success('Pdf Genarated', 'Success!');
          } else {
            this.ngxLoader.stop();
            this.toastr.info('No transaction found for this dates', 'info!');
          }
          console.log('pdf downloaded ');
        },
        () => {
          this.ngxLoader.stop();
          this.toastr.error('Something went wrong', 'Error!');
        }
      );
  }

  downloadPdf(value: String) {
    this.ngxLoader.start();
    var dates = value.split('+');
    var startDate = dates[0];
    var endDate = dates[1];
    let orgID = localStorage.getItem('organization');

    let data = { orgId: orgID, startDate: startDate, endDate: endDate };

    console.log('pdf api', data);

    this.downloadCostReport = this.authService
      .downloadCostReport(data)
      .subscribe(
        (res) => {
          if (res['success']) {
            console.log(this.baseUrl);
            let fileUrl = this.baseUrl + res['pdfUrl'];
            setTimeout(() => {
              window.open(fileUrl);
              this.ngxLoader.stop();
            }, 5000);
            // this.toastr.success('Pdf Genarated', 'Success!');
          } else {
            this.toastr.error('Try after some times', 'Error!');
          }
          console.log('pdf downloaded ');
        },
        () => {
          this.toastr.error('Something went wrong', 'Error!');
          this.ngxLoader.stop();
        }
      );
  }
}
