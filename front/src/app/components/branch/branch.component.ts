import { AfterViewInit, Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { ToastrService } from 'ngx-toastr';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { OrganizationIdSharingService } from '../../service/data.service';
import { Branch } from '../../models/branch.model';
import { Timezone } from '../../models/timezone.model';
import { Country } from '../../models/country.model';
import { Subscription } from 'rxjs';
declare let $: any;

@Component({
  selector: 'app-branch',
  templateUrl: './branch.component.html',
  styleUrls: ['./branch.component.scss']
})
export class BranchComponent implements OnInit, OnDestroy {
  sharingSubscription: Subscription;
  timezoneSubscription: Subscription;
  countrySubscription: Subscription;
  branchListSubscription: Subscription;
  addBranchSubscription: Subscription;
  editBranchSubscription: Subscription;
  deleteBranchSubscription: Subscription;
  branchForm: FormGroup;
  branchList: Branch[];
  orgId: string;
  branchId: string;
  branchName: any;
  permissions: any = [];
  timezoneList: Timezone[];
  countryList: Country[];
  branchPaginator = { limit: 10, skip: 1, total: 0 }

  constructor(private authService: AuthService,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private sharingService: OrganizationIdSharingService) {

    $("#org-dropdown-navbar").prop("disabled", false);
    this.formInit('');

    this.sharingSubscription = this.sharingService.currentOrgId.subscribe(orgId => {
      this.orgId = orgId;
      this.getBranchList(1);
      this.formInit(orgId);
    });
  }

  ngAfterViewInit(): void {
    let that = this;

    setTimeout(function () {
      that.orgId = $("#org-dropdown-navbar").attr('value');

      if (that.orgId) {
        that.formInit(that.orgId);
        that.getBranchList(1);
      }
    }, 300);
  }

  ngOnInit(): void {
    this.formInit('');
    this.getTimezones();
    this.getCountries();
    this.permissions = JSON.parse(localStorage.getItem("permissions"));
  }

  ngOnDestroy(): void {
    this.sharingSubscription.unsubscribe();
    this.timezoneSubscription.unsubscribe();
    this.countrySubscription.unsubscribe();
    this.branchListSubscription.unsubscribe();
    this.addBranchSubscription?.unsubscribe();
    this.editBranchSubscription?.unsubscribe();
    this.deleteBranchSubscription?.unsubscribe();
  }

  formInit(organization) {
    this.branchForm = this.fb.group({
      organization: [organization, Validators.required],
      name: ['', Validators.required],
      timeZone: ['', Validators.required],
      street: [''],
      city: [''],
      country: ['', Validators.required],
      state: [''],
      zipcode: ['']
    });
  }

  getTimezones() {
    this.timezoneSubscription = this.authService.getTimezones().subscribe(res => {
      this.timezoneList = res['data'];
    });
  }

  getCountries() {
    this.countrySubscription = this.authService.getCountries().subscribe(res => {
      this.countryList = res['data'];
    });
  }

  getBranchList(skip) {
    this.branchPaginator.skip = skip;
    let dataToSend = {
      skip: this.branchPaginator.skip,
      limit: this.branchPaginator.limit,
    };
    this.branchForm.patchValue({ organization: this.orgId });

    this.branchListSubscription = this.authService.getBranchList(this.orgId, dataToSend).subscribe(res => {
      if (res['success']) {
        this.branchList = res['data'];
        this.branchPaginator.total = res["total"];
      } else {
        this.toastr.error(res['message'], 'Error!')
      }
    }, () => {
      this.toastr.error('Something went wrong', 'Error!')
    });
  }

  addBranch(formValue) {
    this.addBranchSubscription = this.authService.addBranch(formValue).subscribe(res => {
      if (res['success']) {
        this.toastr.success(res['message'], 'Success!');
        this.clearBranchForm();
        this.getBranchList(1);
      } else {
        this.clearBranchForm();
        this.toastr.error(res['message'], 'Error!')
      }
    }, () => {
      this.clearBranchForm();
      this.toastr.error('Something went wrong', 'Error!')
    });
  }

  clearBranchForm() {
    $("#editBranchModal").modal('hide');
    $("#addBranchModal").modal('hide');
    this.branchForm.reset();
    this.formInit(this.orgId);
  }

  editBranch(branchData: Branch) {
    this.branchForm.reset();

    if (branchData) {
      this.branchId = branchData['_id'];
      this.branchForm.patchValue({
        name: branchData['name'],
        street: branchData['street'],
        state: branchData['state'],
        zipcode: branchData['zipcode'],
        city: branchData['city'],
        country: branchData['country']['_id'],
        organization: branchData['organization'],
        timeZone: branchData['timeZone']['_id']
      });

      $("#editBranchModal").modal('show');
    }
  }

  updateBranch(formValue) {
    this.editBranchSubscription = this.authService.updateBranch(formValue, this.branchId).subscribe(res => {
      if (res['success']) {
        this.toastr.success('Department Edited', 'Success!');
        this.clearBranchForm();
        this.getBranchList(this.branchPaginator.skip);
      } else {
        this.clearBranchForm();
        this.toastr.error(res['message'], 'Error!')
      }
    }, () => {
      this.clearBranchForm();
      this.toastr.error('Something went wrong', 'Error!')
    });
  }


  delete(branch: Branch) {
    if (branch) {
      this.branchId = branch['_id'];
      this.branchName = branch['name'];
      $("#deleteModal").modal('show');
    }
  }

  deleteBranch() {
    this.deleteBranchSubscription = this.authService.deleteBranch(this.branchId).subscribe(res => {
      if (res['success']) {
        this.toastr.success('Branch Deleted', 'Success!');
        $("#deleteModal").modal('hide');
        this.getBranchList(this.branchPaginator.skip);
      } else {
        this.toastr.error(res['message'], 'Error!')
      }
    },
      () => {
        this.toastr.error('Something went wrong', 'Error!')
      });
  }

  openBranchPopUp() {
    this.branchForm.reset();
    this.formInit(this.orgId);
    $("#addBranchModal").modal('show');
  }
}