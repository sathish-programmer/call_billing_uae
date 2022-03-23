import { AfterViewInit, Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { AssignedTariff } from '../../../models/assigned-tariff.model';
import { Branch } from 'src/app/models/branch.model';
import { OrganizationIdSharingService } from 'src/app/service/data.service';
import { Provider } from '../../../models/provider.model';
import { Tariff } from '../../../models/tariff.model';
import { TariffFile } from '../../../models/tariff-file.model';
import * as _ from 'underscore';
import { environment } from 'src/environments/environment';
declare let $: any;

@Component({
  selector: 'app-setup',
  templateUrl: './setup.component.html',
  styleUrls: ['./setup.component.scss']
})
export class SetupComponent implements OnInit, OnDestroy, AfterViewInit {
  sharingSubscription: Subscription;
  providerListSubscription: Subscription;
  addAssignTariffSubscription: Subscription;
  branchesSubscription: Subscription;
  assignedTariffSubscription: Subscription;
  editAssignTariffSubscription: Subscription;
  getTariffListSubscription: Subscription;
  getTariffFileListSubscription: Subscription;
  deleteProviderSubscription: Subscription;
  deleteTariffSubscription: Subscription;
  deleteTariffFileSubscription: Subscription;
  baseUrl = environment.urlForFileDownload+'uploads/';
  orgId: string;
  permissions: any = [];
  providerList: Provider[];
  providerId: any;
  providerName: any;
  tariffId: any;
  tariffName: any;
  toDelete: any;
  assignedTariffList: AssignedTariff[];
  assignTariffId: any;
  tabValue = 1;
  assignTariffForm: FormGroup;
  branchList: Branch[];
  action: any;
  dataToEdit: any;
  file = '';
  tariffList: Tariff[];
  tariffFiles: TariffFile[];
  errorFile = "";
  tariffFileId:any;
  tariffFileName:any;
  showHideAddBtn: any;
  unitMeasurementList = [{ view: "Seconds", value: "1" },
  { view: "Minutes", value: "60" },
  { view: "Hours", value: "3600" }];
  tariffPaginator = { limit: 10, skip: 1, total: 0 };
  assignTariffPaginator = { limit: 10, skip: 1, total: 0 };
  providerPaginator = { limit: 10, skip: 1, total: 0 };
  tariffFilePaginator = { limit: 10, skip: 1, total: 0 }

  constructor(private authService: AuthService,
    private toastr: ToastrService,
    private sharingService: OrganizationIdSharingService,
    private router: Router,
    private fb: FormBuilder,
    private _zone: NgZone,) {

    $("#org-dropdown-navbar").prop("disabled", false);

    this.sharingSubscription = this.sharingService.currentOrgId.subscribe(orgId => {
      this.orgId = orgId;
      this.getDetails(this.orgId);
    });
  }

  ngAfterViewInit(): void {
    let that = this;

    setTimeout(function () {
      that.orgId = $("#org-dropdown-navbar").attr('value');
      if (that.orgId) {
        that.getDetails(that.orgId);
      }
    }, 300);
  }

  ngOnInit(): void {
    this.permissions = JSON.parse(localStorage.getItem("permissions"));
    this.formInit();
  }

  ngOnDestroy(): void {
    this.sharingSubscription.unsubscribe();
    this.providerListSubscription.unsubscribe();
    this.branchesSubscription.unsubscribe();
    this.getTariffListSubscription.unsubscribe();
    this.getTariffFileListSubscription.unsubscribe();
    this.addAssignTariffSubscription?.unsubscribe();
    this.editAssignTariffSubscription?.unsubscribe();
    this.deleteProviderSubscription?.unsubscribe();
    this.deleteTariffSubscription?.unsubscribe();
    this.deleteTariffFileSubscription?.unsubscribe();
  }

  getDetails(orgId) {
    localStorage.setItem("organization", orgId);
    this.getAssignTariffListByLimit(1, this.tabValue);
    this.getTariffFileList(1, this.tabValue);
    this.getProviderListByLimit(1, this.tabValue);
    this.getTariffList(1, this.tabValue)
    this.getBranchList();
  }

  getAssignTariffListByLimit(skip, tabvalue) {
    this.tabValue = tabvalue;
    this.assignTariffPaginator.skip = skip;
    let dataToSend = {
      skip: this.assignTariffPaginator.skip,
      limit: this.assignTariffPaginator.limit,
    };
    this.assignedTariffSubscription = this.authService.getAssignedTariffList(dataToSend, this.orgId).subscribe(res => {
      if (res['success']) {
        this.showHideAddBtn = 'showbutton';
        this.assignTariffPaginator.total = res["total"];
        this.assignedTariffList = res['data'];
      } else {
        this.toastr.error(res['message'], 'Error!')
      }
    }, () => {
      this.toastr.error('Something went wrong', 'Error!')
    });
  }

  getTariffFileList(skip, tabvalue) {
    this.tabValue = tabvalue;
    this.tariffPaginator.skip = skip;
    let dataToSend = {
      skip: this.tariffPaginator.skip,
      limit: this.tariffPaginator.limit,
    };
    this.getTariffFileListSubscription = this.authService.getTariffFile(dataToSend, this.orgId).subscribe(res => {
      console.log("res file____________", res)
      if (res['success']) {
        this.showHideAddBtn = 'hidebutton';
        console.log(this.showHideAddBtn)
        this.tariffFiles = res['data'];
        this.tariffFilePaginator.total = res["total"];
      } else {
        this.toastr.error(res['message'], 'Error!')
      }
    }, () => {
      this.toastr.error('Something went wrong', 'Error!')
    });
  }

  errorsFile(singleTariffFile) {
    this.errorFile = singleTariffFile.errors;
    // $('#errorsFile').modal('show');
  }

  getTariffList(skip, tabvalue) {
    this.tabValue = tabvalue;
    this.tariffPaginator.skip = skip;
    let dataToSend = {
      skip: this.tariffPaginator.skip,
      limit: this.tariffPaginator.limit,
    };

    this.getTariffListSubscription = this.authService.getTariffList(dataToSend, this.orgId).subscribe(res => {
      if (res['success']) {
        this.showHideAddBtn = 'showbutton';
        this.tariffPaginator.total = res["total"];
        for (let index in res['data']) {
          let unit = _.findWhere(this.unitMeasurementList, { value: res['data'][index].unitsMeasurement });
          res['data'][index]['unitsMeasurementName'] = unit.view;
        }
        this.tariffList = res['data'];
      } else {
        this.toastr.error(res['message'], 'Error!')
      }
    }, () => {
      this.toastr.error('Something went wrong', 'Error!')
    });
  }

  getProviderListByLimit(skip, tabvalue) {
    this.tabValue = tabvalue;
    this.providerPaginator.skip = skip;
    let dataToSend = {
      skip: this.providerPaginator.skip,
      limit: this.providerPaginator.limit,
    };

    this.providerListSubscription = this.authService.getProviderList(this.orgId, dataToSend).subscribe(res => {
      if (res['success']) {
        this.showHideAddBtn = 'showbutton';
        this.providerList = res['data'];
        this.providerPaginator.total = res["total"];
      } else {
        this.toastr.error(res['message'], 'Error!')
      }
    }, () => {
      this.toastr.error('Something went wrong', 'Error!')
    });
  }

  getBranchList() {
    this.branchesSubscription = this.authService.getBranchList(this.orgId).subscribe(res => {
      if (res['success']) {
        this.showHideAddBtn = 'showbutton';
        this.branchList = res['data'];
      } else {
        this.toastr.error(res['message'], 'Error!')
      }
    }, () => {
      this.toastr.error('Something went wrong', 'Error!')
    });
  }

  formInit() {
    this.assignTariffForm = this.fb.group({
      organization: [this.orgId, Validators.required],
      branch: ['', Validators.required],
      description: [''],
      provider: ['', Validators.required]
    });
  }

  openNewPageASPerTab(action, data?) {
    if (this.tabValue == 1) {
      this.action = action;
      this.dataToEdit = data;
      $("#addAssignTariff").modal("show");
      if (action == 'add') {
        this.formInit();
      } else {
        this.assignTariffForm.patchValue({
          branch: data['branch']['_id'],
          description: data['description'],
          organization: data['organization'],
          provider: data['provider']['_id']
        });
      }
    } else if (this.tabValue == 2) {
      localStorage.setItem("providerAction", action);
      if (action == 'edit') {
        localStorage.setItem("providerToEdit", JSON.stringify(data));
      }
      this.router.navigate(["admin/inaipi/setup/manage-provider"]);
    } else if (this.tabValue == 3) {
      $("#addTariff").modal("show");
    }
  }

  addEditAssignedTariff() {
    if (this.action == 'add') {
      this.addAssignTariffSubscription = this.authService.addAssignedTariff(this.assignTariffForm.value).subscribe(res => {
        if (res['success']) {
          this.showHideAddBtn = 'showbutton';
          this.toastr.success(res['message'], 'Success!');
          this.clearAssignTariffForm();
          this.getAssignTariffListByLimit(this.assignTariffPaginator.skip, this.tabValue)
        } else {
          this.toastr.error(res['message'], 'Error!')
        }
      }, () => {
        this.toastr.error('Something went wrong', 'Error!')
      });
    } else {
      this.editAssignTariffSubscription = this.authService.editAssignedTariff(this.assignTariffForm.value, this.dataToEdit['_id']).subscribe(res => {
        this.clearAssignTariffForm();
        if (res['success']) {
          this.showHideAddBtn = 'showbutton';
          this.toastr.success(res['message'], 'Success!');
          this.getAssignTariffListByLimit(this.assignTariffPaginator.skip, this.tabValue)
        } else {
          this.toastr.error(res['message'], 'Error!')
        }
      }, () => {
        this.clearAssignTariffForm();
        this.toastr.error('Something went wrong', 'Error!')
      });
    }
  }

  changeBranch(value) {
    this.providerListSubscription = this.authService.getProviderList(this.orgId, "", value?.target?.value).subscribe(res => {
      if (res['success']) {
        this.showHideAddBtn = 'showbutton';
        this.providerList = res['data'];
      } else {
        this.toastr.error(res['message'], 'Error!')
      }
    }, () => {
      this.toastr.error('Something went wrong', 'Error!')
    });
  }

  clearAssignTariffForm() {
    $("#addAssignTariff").modal('hide');
    this.assignTariffForm.reset();
    this.getAssignTariffListByLimit(1, this.tabValue);
  }

  delete(data, toDelete) {
    this.toDelete = toDelete;
    if (toDelete == 'provider') {
      this.providerId = data['_id'];
      this.providerName = data['name'];
      $("#deleteProviderModal").modal('show');
    } else if (toDelete == 'tariff') {
      this.tariffId = data['_id'];
      this.tariffName = data['name'];
      $("#deleteTariffModal").modal('show');
    } else if (toDelete == 'tariffFile') {
      this.tariffFileId = data['_id'];
      this.tariffFileName = data['name'];
      $("#deleteTariffFileModal").modal('show');
    }
    else if (toDelete == 'assingTariff') {
      // console.log(toDelete)
      this.assignTariffId = data['_id'];
      console.log(toDelete+ this.assignTariffId)
      // this.tariffName = 'Assigned Tarrif';
      this.tariffName = data['name'];
      $("#deleteTariffModal").modal('show');
    }
  }

  deleteData() {
    if (this.toDelete == 'provider') {
      this.deleteProviderSubscription = this.authService.deleteProvider(this.providerId).subscribe(res => {
        if (res['success']) {
          // this.showHideAddBtn = 'showbutton';
          this.toastr.success('Provider Deleted', 'Success!');
          $("#deleteModal").modal('hide');
          this.getProviderListByLimit(this.providerPaginator.skip, this.tabValue);
        } else {
          this.toastr.error(res['message'], 'Error!')
        }
      },() => {
        this.toastr.error('Something went wrong', 'Error!')
      });
    } else if (this.toDelete == 'assingTariff') {
          // this.toastr.success('Assigned Tariff Deleted', 'Success!');
          // $("#deleteTariffModal").modal('hide');
      // console.log('test assign del')
      this.deleteTariffSubscription = this.authService.deleteAssginTariff(this.assignTariffId).subscribe(res => {
        console.log('delete ass tarr '+this.assignTariffId)
        if (res['success']) {

          this.toastr.success('Tariff Deleted', 'Success!');
          $("#deleteTariffModal").modal('hide');
          this.getAssignTariffListByLimit(this.assignTariffPaginator.skip, this.tabValue)
        } else {
          this.toastr.error(res['message'], 'Error!')
        }
      },() => {
        this.toastr.error('Something went wrong', 'Error!')
      });
    }
    else if (this.toDelete == 'tariff') {
      this.deleteTariffSubscription = this.authService.deleteTariff(this.tariffId).subscribe(res => {
        if (res['success']) {
          this.toastr.success('Tariff Deleted', 'Success!');
          $("#deleteTariffModal").modal('hide');
          this.getTariffList(this.tariffPaginator.skip, this.tabValue);
        } else {
          this.toastr.error(res['message'], 'Error!')
        }
      },() => {
        this.toastr.error('Something went wrong', 'Error!')
      });
    } else if (this.toDelete == 'tariffFile') {
      this.deleteTariffFileSubscription = this.authService.deleteTariffFile(this.tariffFileId).subscribe(res => {
        if (res['success']) {
          this.toastr.success('Tariff File Deleted', 'Success!');
          $("#deleteTariffFileModal").modal('hide');
          this.getTariffFileList(this.tariffFilePaginator.skip, this.tabValue);
        } else {
          this.toastr.error(res['message'], 'Error!')
        }
      },() => {
        this.toastr.error('Something went wrong', 'Error!')
      });
    }
  }

  getTariffFile(event) {
    var singleData = {};
    this._zone.run(() => {
      if (this.orgId) {
        // this.saveTariffFileDetails(singleData);
        this.getFileData(event['originalFile'], event['originalId']);
      } else {
        this.toastr.error("Please select organization before uploading file", "Error!");
      }
    });
  }

  getFileData(fileDetail, fileId) {
    var f = fileDetail;
    var that = this;

    if (f['name'].indexOf(".csv") > 0) {
      readFile(f, function (content) {
        content = content.split("\n");
        content.splice(0, 1);    // REMOVING FIRST ROW
        if (content[content.length - 1] == ['']) {
          content.pop(content[content.length - 1]);
        }
        let proceed = true;
        var json, data = [], tariffJson, tariffRateAndTimeJson;
        for (var index in content) {
          content[index] = content[index].split(",");

          if (content[index][0] && content[index][5] && content[index][16] && content[index][17]) {
            tariffJson = {};
            tariffRateAndTimeJson = {};
            tariffJson['organization'] = that.orgId;
            tariffJson['name'] = content[index][0];
            tariffJson['externalId'] = content[index][0];
            tariffJson['countryCode'] = content[index][5];
            tariffJson['trunkId'] = content[index][11];
            tariffJson['type'] = "Standard";
            tariffJson['priority'] = content[index][12];
            tariffJson['units'] = content[index][13];
            tariffJson['unitsMeasurement'] = 1;
            tariffJson['countryName'] = content[index][7];
            tariffJson['currencyName'] = content[index][14];
            tariffJson['timeZoneName'] = content[index][15];
            tariffJson['calculationType'] = "Cycle time";
            tariffJson['provider'] = content[index][16] ? content[index][16].split("\r")[0] : "";
            tariffJson['callType'] = content[index][17] ? content[index][17].split("\r")[0] : ""

            tariffRateAndTimeJson['organization'] = that.orgId;
            tariffRateAndTimeJson['rate'] = content[index][9];
            tariffRateAndTimeJson['specialRate'] = content[index][10];
            tariffRateAndTimeJson['rateStartDate'] = content[index][1] + " " + content[index][3];
            tariffRateAndTimeJson['rateEndDate'] = content[index][2] + " " + content[index][4];
            tariffRateAndTimeJson['specialRateStartDate'] = content[index][1] + " " + content[index][3];
            tariffRateAndTimeJson['specialRateEndDate'] = content[index][2] + " " + content[index][4];

            json = JSON.parse(JSON.stringify({
              tariffDetail: tariffJson,
              tariffRateAndTimeDetail: tariffRateAndTimeJson
            }));

            data.push(json);
          } else {
            proceed = false;
          }
        }
        var dataToSend = { tariff: data, fileId: fileId, organization: that.orgId };
        if (proceed) {
          that.authService.saveTariffFomFile(dataToSend).subscribe(res => {
            if (res['success']) {
              that.toastr.success(res['message'], 'Success!')
              that.getTariffFileList(1, that.tabValue);
              that.getTariffList(that.tariffPaginator.skip, that.tabValue);
              $('#addTariff').modal('hide');
            } else {
              that.toastr.error(res['message'], 'Error!')
            }
          }, () => {
            that.toastr.error('Something went wrong', 'Error!')
          });
        } else {
          that.toastr.error('Something wrong in the file', 'Error!');
          $("#addTariff").modal("hide");
          return
        }
      });
    } else {
      this.toastr.error("Please upload a csv file");
      this.file = '';
    }

    function readFile(f, onLoadCallback) {
      var reader = new FileReader();
      reader.onload = function (e) {
        var contents = e.target.result;
        onLoadCallback(contents);
      }
      reader.readAsText(f);
    };
  }

  goToManageTariffPage(tariffAction, id) {
    $("#addTariff").modal("hide");
    localStorage.setItem("tariffAction", tariffAction);
    localStorage.setItem("tariffId", id);
    this.router.navigate(['/admin/inaipi/setup/manage-tariff']);
  }

}
