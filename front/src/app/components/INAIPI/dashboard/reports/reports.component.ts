import { AfterViewInit, Component, NgZone, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { of, Subscription } from 'rxjs';
import { OrganizationIdSharingService } from 'src/app/service/data.service';
import { NgForm } from '@angular/forms';
import * as moment from 'moment';
import * as _ from 'underscore';
import { AuthService } from 'src/app/auth/auth.service';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { environment } from 'src/environments/environment';

declare let $: any;

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
})
export class ReportsComponent implements OnInit, AfterViewInit {
  sharingSubscription: Subscription;
  branchListSubscription: Subscription;
  deptListSubscription: Subscription;
  extensionListSubscription: Subscription;
  saveCallReportFilterSubscription: Subscription;
  savedFilterListSubscription: Subscription;
  deleteCallReportFilterSubscription: Subscription;
  editCallReportFilterSubscription: Subscription;
  callReportsListSubscription: Subscription;
  downloadCSVSubscription: Subscription;
  downloadPDFSubscription: Subscription;

  checkReport: boolean = true;

  checkReportBasedOnExt: boolean;
  checkReportBasedOnNotExt: boolean;

  showReportBasedOnType: any;

  totalIncomingCalls: any;
  totalOutgoingCalls: any;
  totalMissedCalls: any;
  totalCallsForExt: any;
  totalAmountForExt: any;

  optionAnswers = [
    { value: 'detail_report', name: 'Detail' },
    { value: 'summary_report', name: 'Summary' },
  ];

  report_type_val: any;

  getUserEmail: any;
  roleAccess: boolean;

  orgId: string;
  permissions: any = [];
  isSU = localStorage.getItem('isSU');
  tabValue = 1;

  baseUrl = environment.urlForFileDownload;
  searchData = '';

  callReportForm: FormGroup;
  timeFormat = 'MMM D, YYYY h:mm a';
  startDate: any;
  endDate: any;
  saveFormValue = {};
  validationMaxDate = moment();
  config = {
    max: this.validationMaxDate,
  };

  savedTemplateId = '';
  savedFilterId: any;
  savedFilter = [];
  branchList = [];
  departmentList = [];
  extensionList: any = [];
  callReports = [];

  TotalCalls: any;
  TotalSeconds: any;
  TotalDuration: any;
  TotalAmount: any;
  AnsweredCalls: any;
  MissedCalls: any;

  allBranch: [''];
  allDepartment: [''];
  allExtension: [''];
  allCallType: [''];
  allDirection: [''];

  selected: boolean;

  callReportPaginator = { limit: 100, skip: 1, total: 0 };

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

  groupByList = [
    { view: 'Call Time', value: 'CallTime' },
    { view: 'Caller Number', value: 'Callernumber' },
    { view: 'Called Number', value: 'Callednumber' },
    { view: 'Branch', value: 'branch' },
    { view: 'Call Duration', value: 'CallDuration' },
    { view: 'Call Cost', value: 'CalculatedCost' },
    { view: 'Department', value: 'department' },
  ];

  orderByList = [
    { view: 'Call Time', value: 'CallTime' },
    { view: 'Caller Number', value: 'Callernumber' },
    { view: 'Called Number', value: 'Callednumber' },
  ];

  callTypes: any = [
    { view: 'Voice Mails', value: 'voicemail' },
    { view: 'Conference Calls', value: 'conference' },
    { view: 'Transfer Calls', value: 'transfer' },
    { view: 'Missed Calls', value: 'missed' },
    { view: 'Internal Calls', value: 'internal' },
    { view: 'Service Calls', value: 'service' },
    { view: 'Local Calls', value: 'local' },
    { view: 'Mobile Calls', value: 'mobile' },
    // { view: "National Calls", value: "national" },
    { view: 'International Calls', value: 'international' },
  ];

  directionType = [
    { view: 'Incoming', value: 'I' },
    { view: 'Outgoing', value: 'O' },
  ];

  costEnabledDisabledType = [
    { view: 'Enabled', value: true },
    { view: 'Disabled', value: false },
  ];

  constructor(
    private _zone: NgZone,
    private sharingService: OrganizationIdSharingService,
    private fb: FormBuilder,
    private authService: AuthService,
    private toastr: ToastrService,
    private ngxLoader: NgxUiLoaderService
  ) {
    if (this.isSU == 'true') {
      $('#org-dropdown-navbar').prop('disabled', false);
    } else {
      $('#org-dropdown-navbar').prop('disabled', true);
    }

    this.sharingSubscription = this.sharingService.currentOrgId.subscribe(
      (orgId) => {
        this.orgId = orgId;
        this.formInit(orgId);
        this.getLists(orgId);
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
      }
    }, 300);
  }

  ngOnInit(): void {
    this.permissions = JSON.parse(localStorage.getItem('permissions'));
    this.getUserEmail = localStorage.getItem('email');
  }

  ngOnDestroy(): void {
    this.sharingSubscription.unsubscribe();
    this.branchListSubscription.unsubscribe();
    this.deptListSubscription.unsubscribe();
    this.extensionListSubscription.unsubscribe();
    this.saveCallReportFilterSubscription?.unsubscribe();
    this.savedFilterListSubscription.unsubscribe();
    this.deleteCallReportFilterSubscription?.unsubscribe();
    this.editCallReportFilterSubscription?.unsubscribe();
    this.downloadCSVSubscription?.unsubscribe();
    this.downloadPDFSubscription?.unsubscribe();
  }

  select(event) {
    console.log(event);
  }

  formInit(organization: string) {
    this.callReportForm = this.fb.group({
      organization: [organization, Validators.required],
      dRTOption: [''],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      branch: [[]],
      department: [[]],
      extension: [[]],
      callType: [[]],
      direction: [[]],
      orderBy: [''],
      groupBy: [''],
      costEnabled: [],
      searchByNumber: [''],
      reportType: [''],
      fileName: [''],
    });
  }

  getLists(orgId) {
    this.getBranches(orgId);
    this.getDeptByBranch('');
    this.getExtensionList('', '');
    this.getSavedFilterList(orgId);
  }

  getBranches(orgId) {
    this.branchListSubscription = this.authService
      .getCallLogsBranchList(orgId)
      .subscribe(
        (res) => {
          if (res['success']) {
            this.branchList = res['data'];
          } else {
            this.toastr.error(res['message'], 'Error!');
          }
        },
        () => {
          this.toastr.error('Something went wrong', 'Error!');
        }
      );
  }

  getDeptByBranch(branchId) {
    this.ngxLoader.start();
    this.deptListSubscription = this.authService
      .getCallLogsDeptList(branchId, this.orgId)
      .subscribe(
        (res) => {
          if (res['success']) {
            this.departmentList = res['data'];
          } else {
            this.toastr.error(res['message'], 'Error!');
          }
        },
        () => {
          this.toastr.error('Something went wrong', 'Error!');
        }
      );
    this.ngxLoader.stop();
  }

  getExtensionList(branchId, departmentId) {
    this.ngxLoader.start();
    this.extensionListSubscription = this.authService
      .getCallLogsExtensionList(branchId, departmentId, this.orgId)
      .subscribe(
        (res) => {
          if (res['success']) {
            this.extensionList = res['data'];
          } else {
            this.toastr.error(res['message'], 'Error!');
          }
        },
        () => {
          this.toastr.error('Something went wrong', 'Error!');
        }
      );
    this.ngxLoader.stop();
  }

  getSavedFilterList(orgId) {
    console.log('org check', orgId);
    this.savedFilterListSubscription = this.authService
      .getSavedListFilterList(orgId)
      .subscribe(
        (res) => {
          if (res['success']) {
            this.savedFilter = res['data'];
            console.log(res['data'], 'test check');
          } else {
            this.toastr.error(res['message'], 'Error!');
          }
        },
        () => {
          this.toastr.error('Something went wrong', 'Error!');
        }
      );
  }

  downloadReportCSV() {
    this.ngxLoader.start();

    let fileName = this.getFileName();
    if (
      this.saveFormValue['fileName'] == '' ||
      this.saveFormValue['fileName'] == null
    ) {
      this.saveFormValue['fileName'] = fileName;
    }
    this.saveFormValue['reportType'] = this.report_type_val;
    if (fileName) {
      this.downloadCSVSubscription = this.authService
        .downloadReportCSV(this.orgId, this.saveFormValue)
        .subscribe(
          (res) => {
            if (res['success']) {
              let fileUrl = this.baseUrl + res['data']['url'];
              window.open(fileUrl);
            } else {
              this.toastr.error(res['message'], 'Error!');
            }
          },
          () => {
            this.toastr.error('Something went wrong', 'Error!');
          }
        );
    } else {
      this.toastr.error(
        "Please add name under 'Save As' to give download file a name",
        'Error!'
      );
    }
    this.ngxLoader.stop();
  }

  downloadReportExcel() {
    this.ngxLoader.start();

    let fileName = this.getFileName();
    if (
      this.saveFormValue['fileName'] == '' ||
      this.saveFormValue['fileName'] == null
    ) {
      this.saveFormValue['fileName'] = fileName;
    }
    this.saveFormValue['reportType'] = this.report_type_val;
    console.log(this.saveFormValue);
    // return;
    if (fileName) {
      if (fileName != 'Extension Summary') {
        this.downloadPDFSubscription = this.authService
          .downloadReportPDF(this.orgId, this.saveFormValue)
          .subscribe(
            (res) => {
              if (res['success']) {
                let fileUrl = this.baseUrl + res['data']['url'];
                window.open(fileUrl);
              } else {
                this.toastr.error(res['message'], 'Error!');
              }
            },
            () => {
              this.toastr.error('Something went wrong', 'Error!');
            }
          );
      } else {
        this.downloadPDFSubscription = this.authService
          .downloadReportPDFForExtension(this.orgId, this.saveFormValue)
          .subscribe(
            (res) => {
              if (res['success']) {
                let fileUrl = this.baseUrl + res['data']['url'];
                window.open(fileUrl);
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
      this.toastr.error(
        "Please add name under 'Save As' to give download file a name",
        'Error!'
      );
    }
    this.ngxLoader.stop();
  }

  getFileName() {
    let rawValue = this.callReportForm.getRawValue();
    // console.log(rawValue)
    return rawValue['fileName'];
  }

  keyDownFunction(event) {
    if (event.keyCode == 13) {
      this.getReport(this.saveFormValue, 1);
    }
  }

  getReport(formValue, event) {
    let reportType = formValue['reportType'];

    if (reportType == 'summary_report') {
      this.showReportBasedOnType = 'summary';
      this.checkReport = false;
    } else if (
      reportType == 'detail_report' ||
      reportType == '' ||
      reportType == undefined
    ) {
      this.checkReport = true;
      this.showReportBasedOnType = 'detail';
    }
    this.callReportPaginator.skip = event;
    this.ngxLoader.start();
    formValue['skip'] =
      this.callReportPaginator.skip - 1 > 0
        ? (this.callReportPaginator.skip - 1) * this.callReportPaginator.limit
        : 0;
    formValue['limit'] = this.callReportPaginator.limit;
    formValue['searchData'] = this.searchData || '';
    formValue['startDate'] = moment(formValue['startDate'])
      .utc(true)
      .startOf('day');
    formValue['endDate'] = moment(formValue['endDate']).utc(true).endOf('day');
    this.saveFormValue = formValue;

    console.log(formValue, 'form val');

    if (formValue['fileName'] !== 'Extension Summary') {
      this.callReportsListSubscription = this.authService
        .getCallReportsList(this.orgId, formValue)
        .subscribe(
          (res) => {
            if (res['success']) {
              this.checkReportBasedOnExt = false;
              this.checkReportBasedOnNotExt = true;
              this.callReports = res['query'];
              this.TotalCalls = res['TotalCalls'];
              this.TotalSeconds = res['TotalSeconds'];
              this.TotalDuration = res['TotalDuration'];
              this.TotalAmount = res['TotalAmount'];
              this.AnsweredCalls = res['AnsweredCalls'];
              this.MissedCalls = res['MissedCalls'];

              this.callReportPaginator.total = res['total'];
              this.ngxLoader.stop();
            } else {
              this.toastr.error(res['message'], 'Error!');
              this.ngxLoader.stop();
            }
          },
          () => {
            this.toastr.error('Something went wrong', 'Error!');
            this.ngxLoader.stop();
          }
        );
    } else {
      this.callReportsListSubscription = this.authService
        .getCallReportsListBasedOnExtension(this.orgId, formValue)
        .subscribe(
          (res) => {
            if (res['success']) {
              this.callReports = res['query'];
              this.checkReportBasedOnExt = true;
              this.checkReportBasedOnNotExt = false;
              this.callReportPaginator.total = res['total'];

              this.totalIncomingCalls = res['totalIncomingCalls'];
              this.totalOutgoingCalls = res['totalOutgoingCalls'];
              this.totalMissedCalls = res['totalMissedCalls'];
              this.totalCallsForExt = res['totalCalls'];
              this.totalAmountForExt = res['totalAmount'];

              this.ngxLoader.stop();
            } else {
              this.toastr.error(res['message'], 'Error!');
              this.ngxLoader.stop();
            }
          },
          () => {
            this.toastr.error('Something went wrong', 'Error!');
            this.ngxLoader.stop();
          }
        );
    }

    this.searchData = '';
  }

  fillFormValue(savedFilterDataId, event) {
    let selectedIndex: any = event.target['selectedIndex'];
    let setRole =
      event.target.options[selectedIndex].getAttribute('data-editrole');
    console.log(setRole);

    if (setRole == 'superAdmin' && this.getUserEmail != 'admin@inaipi.com') {
      this.roleAccess = false;
    } else {
      this.roleAccess = true;
    }

    this._zone.run(() => {
      let savedFilterData = _.findWhere(this.savedFilter, {
        _id: savedFilterDataId,
      });
      this.startDate = moment(savedFilterData['startDate']);
      this.endDate = moment(savedFilterData['endDate']);
      this.callReportForm.patchValue({
        fileName: savedFilterData['fileName'],
        startDate: this.startDate,
        endDate: this.endDate,
        extension: savedFilterData['extension'] || [],
        branch: savedFilterData['branch'] || [],
        department: savedFilterData['department'] || [],
        callType: savedFilterData['callType'] || [],
        direction: savedFilterData['direction'] || [],
        orderBy: savedFilterData['orderBy'] || '',
        groupBy: savedFilterData['groupBy'] || '',
        costEnabled: savedFilterData['costEnabled'],
        searchByNumber: savedFilterData['searchByNumber'] || '',
        reportType: savedFilterData['reportType'] || '',
        dRTOption: savedFilterData['dRTOption'] || '',
      });

      if (savedFilterData['dRTOption']) {
        this.setFromAndToDate(savedFilterData['dRTOption']);
      } else {
        this.startDateChange(this.startDate);
        this.endDateChange(this.endDate);
      }
    });
  }

  fetchExtension(selectedOrg) {
    let formRawValue = this.callReportForm.getRawValue();
    this.callReportForm.controls['extension'].patchValue([]);
    this.getExtensionList(formRawValue['branch'], formRawValue['department']);
  }

  fetchDepartmentAndExtension() {
    let formRawValue = this.callReportForm.getRawValue();
    this.callReportForm.controls['department'].patchValue([]);
    this.callReportForm.controls['extension'].patchValue([]);
    this.getDeptByBranch(formRawValue['branch']);
    this.getExtensionList(formRawValue['branch'], formRawValue['department']);
  }

  setFromAndToDate(view) {
    let dRTValues = _.findWhere(this.dateRangeType, { view: view })['value'];
    this.startDateChange(dRTValues['startDate']);
    this.endDateChange(dRTValues['endDate']);
  }

  startDateChange(event) {
    console.log;
    this._zone.run(() => {
      this.startDate = moment(event._d);
      this.callReportForm.patchValue({ startDate: this.startDate });
    });
  }

  endDateChange(event) {
    this._zone.run(() => {
      this.endDate = moment(event._d);
      this.callReportForm.patchValue({ endDate: this.endDate });
    });
  }

  selectAllBranches(allBranch) {
    let branchIds = [];
    _.each(this.branchList, (branch: any) => {
      branch.selected = allBranch;
      if (allBranch) {
        branchIds.push(branch._id);
      }
    });
    this.callReportForm.patchValue({ branch: branchIds });
    this.fetchDepartmentAndExtension();
  }

  selectAllDepartments(allDepartment) {
    let departmentIds = [];
    _.each(this.departmentList, (department: any) => {
      department.selected = allDepartment;
      if (allDepartment) {
        departmentIds.push(department._id);
      }
    });

    this.callReportForm.patchValue({ department: departmentIds });
    this.fetchExtension(this.orgId);
  }

  selectAllExtensions(allExtension) {
    let extensionIds = [];
    _.each(this.extensionList, (extension: any) => {
      extension.selected = allExtension;
      if (allExtension) {
        extensionIds.push(extension._id);
      }
    });

    this.callReportForm.patchValue({ extension: extensionIds });
  }

  selectAllCallType(allCallType) {
    let callTypes = [];
    _.each(this.callTypes, (callType: any) => {
      callType.selected = allCallType;
      if (allCallType) {
        callTypes.push(callType.value);
      }
    });

    this.callReportForm.patchValue({ callType: callTypes });
  }

  selectAllDirections(allDirection) {
    let directions = [];
    _.each(this.directionType, (directionType: any) => {
      directionType.selected = allDirection;
      if (allDirection) {
        directions.push(directionType.value);
      }
    });

    this.callReportForm.patchValue({ direction: directions });
  }

  saveCallReportFilter(orgId, template) {
    this.ngxLoader.start();
    this.saveCallReportFilterSubscription = this.authService
      .saveCallReportFilter(this.callReportForm.value)
      .subscribe(
        (res) => {
          this.ngxLoader.stop();
          if (res['success']) {
            this.clearFilter();
            this.toastr.success(res['message'], 'Success!');
            this.getSavedFilterList(this.orgId);
          } else {
            this.toastr.error(res['message'], 'Error!');
          }
        },
        () => {
          this.ngxLoader.stop();
          this.toastr.error('Something went wrong', 'Error!');
        }
      );
  }

  editCallReportFilter(orgId, template) {
    this.ngxLoader.start();
    this.editCallReportFilterSubscription = this.authService
      .editCallReportFilter(this.callReportForm.value, template)
      .subscribe(
        (res) => {
          if (res['success']) {
            this.clearFilter();
            this.toastr.success(res['message'], 'Success!');
            this.getSavedFilterList(this.orgId);
          } else {
            this.toastr.error(res['message'], 'Error!');
          }
        },
        () => {
          this.toastr.error('Something went wrong', 'Error!');
        }
      );
    this.ngxLoader.stop();
  }

  clearFilter() {
    this._zone.run(() => {
      this.callReportForm.reset();
      this.savedTemplateId = '';
      this.selected = false;
      this.getLists(this.orgId);
    });
  }

  delete(savedFilterId) {
    this.savedFilterId = savedFilterId;
    $('#deleteModal').modal('show');
  }

  deleteSavedFilter() {
    this.ngxLoader.start();
    this.deleteCallReportFilterSubscription = this.authService
      .deleteSavedFilter(this.savedFilterId)
      .subscribe(
        (res) => {
          if (res['success']) {
            this.clearFilter();
            $('#deleteModal').modal('hide');
            this.toastr.success('Template Deleted', 'Success!');
            this.getSavedFilterList(this.orgId);
          } else {
            this.toastr.error(res['message'], 'Error!');
          }
        },
        () => {
          this.toastr.error('Something went wrong', 'Error!');
        }
      );
    this.ngxLoader.stop();
  }

  reportChanges(event: any) {
    let selectedLaw: any = event.target.value;
    let report_type = selectedLaw;
    this.report_type_val = report_type;

    if (report_type == 'detail_report') {
      this.checkReport = true;
    } else {
      this.checkReport = false;
    }
    //  this.change.emit(selectedLaw.value);
  }
}
