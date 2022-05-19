import { AfterViewInit, Component, NgZone, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { Provider } from 'src/app/models/provider.model';
import { Timezone } from 'src/app/models/timezone.model';
import { OrganizationIdSharingService } from 'src/app/service/data.service';
import * as moment from 'moment';
declare let $: any;

@Component({
  selector: 'app-manage-tariff',
  templateUrl: './manage-tariff.component.html',
  styleUrls: ['./manage-tariff.component.scss'],
})
export class ManageTariffComponent implements OnInit, AfterViewInit {
  sharingSubscription: Subscription;
  providerListSubscription: Subscription;
  currencyListSubscription: Subscription;
  timezoneSubscription: Subscription;
  addTariffSubscription: Subscription;
  addTariffRateTimeSubscription: Subscription;
  tariffRateTimeSubscription: Subscription;
  getTariffDataSubscription: Subscription;
  editTariffSubscription: Subscription;
  editTariffRateTimeSubscription: Subscription;
  providerList: Provider[];
  tariffForm: FormGroup;
  tariffRatesAndTimeForm: FormGroup;
  orgId: string;
  permissions: any = [];
  timeZoneList: Timezone[];
  currencyList: [] = [];
  tariffRateTimeList: [] = [];
  tariffDataToEdit: any;
  tariffAction: any;
  tariffRateTimeAction: any;
  tariffId: '';
  tariffRateTimeId: any;

  ShowTariffRateAndTimeDiv = false;
  unitMeasurementList = [
    { view: 'Seconds', value: '1' },
    { view: 'Minutes', value: '60' },
    { view: 'Hours', value: '3600' },
  ];

  tariffTypeList = [
    { view: 'Custom', value: 'Custom' },
    { view: 'Standard', value: 'Standard' },
  ];

  calculationTypeList = [
    { view: 'Pro rata', value: 'Pro rata' },
    { view: 'Cycle time', value: 'Cycle time' },
  ];

  callTypes: any = [
    { view: 'Local', value: 'local' },
    { view: 'Mobile', value: 'mobile' },
    { view: 'International', value: 'international' },
  ];

  constructor(
    private authService: AuthService,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private sharingService: OrganizationIdSharingService,
    private router: Router,
    private _zone: NgZone
  ) {
    $('#org-dropdown-navbar').prop('disabled', true);

    this.formInit('');
    this.sharingSubscription = this.sharingService.currentOrgId.subscribe(
      (orgId) => {
        this.orgId = orgId;
        this.formInit(orgId);
        this.getLists(orgId);
        if (this.tariffAction == 'edit') {
          let tariffId = localStorage.getItem('tariffId');
          this.getTariffDataToEdit(tariffId);
        }
      }
    );
  }

  ngAfterViewInit(): void {
    let that = this;

    setTimeout(function () {
      that.orgId = $('#org-dropdown-navbar').attr('value');

      if (that.orgId) {
        that.formInit(that.orgId);
        that.getLists(that.orgId);
        if (that.tariffAction == 'edit') {
          let tariffId = localStorage.getItem('tariffId');
          that.getTariffDataToEdit(tariffId);
        }
      }
    }, 300);
  }

  ngOnInit(): void {
    this.permissions = JSON.parse(localStorage.getItem('permissions'));
    this.tariffAction = localStorage.getItem('tariffAction');
  }

  ngOnDestroy(): void {
    this.sharingSubscription.unsubscribe();
    this.providerListSubscription.unsubscribe();
    this.timezoneSubscription.unsubscribe();
    this.addTariffSubscription?.unsubscribe();
    this.addTariffRateTimeSubscription?.unsubscribe();
    this.tariffRateTimeSubscription?.unsubscribe();
    this.getTariffDataSubscription?.unsubscribe();
    this.editTariffSubscription?.unsubscribe();
    this.editTariffRateTimeSubscription?.unsubscribe();
  }

  formInit(organization: string) {
    this.tariffForm = this.fb.group({
      organization: [organization, Validators.required],
      provider: ['', Validators.required],
      name: ['', Validators.required],
      type: ['', Validators.required],
      units: ['', Validators.required],
      unitsMeasurement: ['', Validators.required],
      currency: [''],
      timeZone: [''],
      callType: [''],
      calculationType: ['', Validators.required],
      priority: [''],
      externalId: [''],
      trunkId: [''],
      countryCode: [''],
    });

    this.tariffRatesAndTimeForm = this.fb.group({
      organization: [organization, Validators.required],
      tariffId: [this.tariffId],
      rate: ['', Validators.required],
      rateStartDate: ['', Validators.required],
      rateEndDate: ['', Validators.required],
      specialRate: ['', Validators.required],
      specialRateStartDate: ['', Validators.required],
      specialRateEndDate: ['', Validators.required],
      minimum: [''],
      maximum: [''],
    });
  }

  getLists(orgId) {
    this.providerListSubscription = this.authService
      .getProviderList(orgId)
      .subscribe(
        (res) => {
          if (res['success']) {
            this.providerList = res['data'];
          } else {
            this.toastr.error(res['message'], 'Error!');
          }
        },
        () => {
          this.toastr.error('Something went wrong', 'Error!');
        }
      );

    this.currencyListSubscription = this.authService
      .getCurrencyList(orgId)
      .subscribe(
        (res) => {
          if (res['success']) {
            this.currencyList = res['data'];
          } else {
            this.toastr.error(res['message'], 'Error!');
          }
        },
        () => {
          this.toastr.error('Something went wrong', 'Error!');
        }
      );

    this.timezoneSubscription = this.authService.getTimezones().subscribe(
      (res) => {
        if (res['success']) {
          this.timeZoneList = res['data'];
        } else {
          this.toastr.error(res['message'], 'Error!');
        }
      },
      () => {
        this.toastr.error('Something went wrong', 'Error!');
      }
    );
  }

  getTariffDataToEdit(tariffId) {
    this.tariffId = tariffId;
    this.getTariffDataSubscription = this.authService
      .getTariffDataToEdit(tariffId)
      .subscribe(
        (res) => {
          if (res['success']) {
            this.tariffForm.patchValue(res['data']);
          } else {
            this.toastr.error(res['message'], 'Error!');
          }
        },
        () => {
          this.toastr.error('Something went wrong', 'Error!');
        }
      );
    this.getTariffRateAndTimeList(tariffId);
  }

  createUpdateTariff(formValue) {
    if (this.tariffAction == 'add') {
      this.addTariffSubscription = this.authService
        .addTariff(formValue)
        .subscribe(
          (res) => {
            if (res['success']) {
              this.tariffId = res['data'];
              this.toastr.success(res['message'], 'Success!');
              this.tariffForm.reset();
            } else {
              this.toastr.error(res['message'], 'Error!');
            }
          },
          () => {
            this.toastr.error('Something went wrong', 'Error!');
          }
        );
    } else {
      this.editTariffSubscription = this.authService
        .editTariff(formValue, this.tariffId)
        .subscribe(
          (res) => {
            if (res['success']) {
              this.toastr.success(res['message'], 'Success!');
              this.tariffForm.reset();
              this.router.navigate(['admin/inaipi/setup']);
            } else {
              this.toastr.error(res['message'], 'Error!');
            }
          },
          () => {
            this.tariffForm.reset();
            this.toastr.error('Something went wrong', 'Error!');
          }
        );
    }
  }

  addRateTime() {
    this.tariffRatesAndTimeForm.getRawValue();
    this.tariffRatesAndTimeForm.patchValue({ tariffId: this.tariffId });
    this.tariffRateTimeAction = 'add';
  }

  createAndUpdateTariffRateAndTime(formValue) {
    if (this.tariffRateTimeAction == 'add') {
      if (!formValue['tariffId']) {
        this.toastr.error('Tariff Basic details are not set', 'Error!');
      } else {
        this.addTariffRateTimeSubscription = this.authService
          .addTariffRateAndTime(this.tariffRatesAndTimeForm.value)
          .subscribe(
            (res) => {
              if (res['success']) {
                this.toastr.success(res['message'], 'Success!');
                this.tariffRatesAndTimeForm.reset();
                this.ShowTariffRateAndTimeDiv = false;
                this.getTariffRateAndTimeList(this.tariffId);
              } else {
                this.toastr.error(res['message'], 'Error!');
              }
            },
            () => {
              this.toastr.error('Something went wrong', 'Error!');
            }
          );
      }
    } else {
      this.editTariffRateTimeSubscription = this.authService
        .editTariffRateTime(formValue, this.tariffRateTimeId)
        .subscribe(
          (res) => {
            if (res['success']) {
              this.toastr.success(res['message'], 'Success!');
              this.tariffRatesAndTimeForm.reset();
              this.ShowTariffRateAndTimeDiv = false;
              this.getTariffRateAndTimeList(this.tariffId);
            } else {
              this.toastr.error(res['message'], 'Error!');
            }
          },
          () => {
            this.tariffForm.reset();
            this.toastr.error('Something went wrong', 'Error!');
          }
        );
    }
  }

  getTariffRateAndTimeList(id) {
    this.tariffRateTimeSubscription = this.authService
      .getTariffRateTime(id)
      .subscribe(
        (res) => {
          if (res['success']) {
            this.tariffRateTimeList = res['data'];
          } else {
            this.toastr.error(res['message'], 'Error!');
          }
        },
        () => {
          this.toastr.error('Something went wrong', 'Error!');
        }
      );
  }

  setRateAndTimeFormData(data) {
    this.tariffRateTimeId = data['_id'];
    this.ShowTariffRateAndTimeDiv = true;
    this.tariffRateTimeAction = 'edit';
    this.tariffRatesAndTimeForm.patchValue({
      organization: data['organization'],
      tariffId: data['tariffId'],
      rate: data['rate'],
      rateStartDate: moment(data['rateStartDate']).utc(),
      rateEndDate: moment(data['rateEndDate']).utc(),
      specialRate: data['specialRate'],
      specialRateStartDate: moment(data['specialRateStartDate']).utc(),
      specialRateEndDate: moment(data['specialRateEndDate']).utc(),
      minimum: data['minimum'],
      maximum: data['maximum'],
    });
  }

  startDateAndTimeChange(event) {
    var date = moment(event.date._d).utc();
    this.tariffRatesAndTimeForm.controls['rateStartDate'].patchValue(date);
  }

  endDateAndTimeChange(event) {
    var date = moment(event.date._d).utc();
    this.tariffRatesAndTimeForm.controls['rateEndDate'].patchValue(date);
  }

  specialStartDateAndTimeChange(event) {
    var date = moment(event.date._d).utc();
    this.tariffRatesAndTimeForm.controls['specialRateStartDate'].patchValue(
      date
    );
  }

  specialEndDateAndTimeChange(event) {
    var date = moment(event.date._d).utc();
    this.tariffRatesAndTimeForm.controls['specialRateEndDate'].patchValue(date);
  }

  numericOnly(event): boolean {
    let patt = /^([0-9])$/;
    let result = patt.test(event.key);
    return result;
  }
}
