import { AfterViewInit, Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { Department } from '../../models/department.model';
import { AuthService } from '../../auth/auth.service';
import { ToastrService } from 'ngx-toastr';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { OrganizationIdSharingService } from '../../service/data.service';
import { Subscription } from 'rxjs';
import { Branch } from 'src/app/models/branch.model';
declare let $: any;

@Component({
  selector: 'app-department',
  templateUrl: './department.component.html',
  styleUrls: ['./department.component.scss']
})
export class DepartmentComponent implements OnInit, AfterViewInit, OnDestroy {
  sharingSubscription: Subscription;
  deptListSubscription: Subscription;
  branchListSubscription: Subscription;
  addDeptSubscription: Subscription;
  editDeptSubscription: Subscription;
  deleteDepartmentSubscription: Subscription;
  departmentForm: FormGroup;
  deptList: Department[];
  orgId: string;
  deptId: string;
  permissions: any = [];
  branchList: Branch[];
  branch: any;
  departmentName: any;
  deptPaginator = { limit: 10, skip: 1, total: 0 }

  constructor(private authService: AuthService,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private sharingService: OrganizationIdSharingService) {

    $("#org-dropdown-navbar").prop("disabled", false);
    this.formInit('');
    this.sharingSubscription = this.sharingService.currentOrgId.subscribe(orgId => {
      this.orgId = orgId;
      this.formInit(orgId);
      this.getdeptList(1);
      this.getBranchList();
    });
  }

  ngAfterViewInit(): void {
    let that = this;

    setTimeout(function () {
      that.orgId = $("#org-dropdown-navbar").attr('value');

      if (that.orgId) {
        that.formInit(that.orgId);
        that.getdeptList(1);
        that.getBranchList();
      }
    }, 300);
  }

  ngOnInit(): void {
    this.permissions = JSON.parse(localStorage.getItem("permissions"));
  }

  ngOnDestroy(): void {
    this.sharingSubscription.unsubscribe();
    this.branchListSubscription.unsubscribe();
    this.deptListSubscription.unsubscribe();
    this.addDeptSubscription?.unsubscribe();
    this.editDeptSubscription?.unsubscribe();
  }

  formInit(organization: string) {
    this.departmentForm = this.fb.group({
      organization: [organization, Validators.required],
      name: ['', Validators.required],
      branch: ['', Validators.required]
    });
  }

  getdeptList(skip) {
    // Setting Organization
    this.departmentForm.patchValue({ organization: this.orgId });
    this.deptPaginator.skip = skip;
    let dataToSend = {
      skip: this.deptPaginator.skip,
      limit: this.deptPaginator.limit,
    };
    this.deptListSubscription = this.authService.getDepartmentList(this.orgId, dataToSend).subscribe(res => {
      if (res['success']) {
        this.deptList = res['data'];
        this.deptPaginator.total = res["total"];
      } else {
        this.toastr.error(res['message'], 'Error!')
      }
    }, () => {
      this.toastr.error('Something went wrong', 'Error!')
    });
  }

  getBranchList() {
    this.branchListSubscription = this.authService.getBranchList(this.orgId).subscribe(res => {
      if (res['success']) {
        this.branchList = res['data'];
      } else {
        this.toastr.error(res['message'], 'Error!')
      }
    }, () => {
      this.toastr.error('Something went wrong', 'Error!')
    });
  }

  addDept(formValue) {
    this.addDeptSubscription = this.authService.addDepartment(formValue).subscribe(res => {
      if (res['success']) {
        this.toastr.success(res['message'], 'Success!');
        this.clearDepartmentForm();
        this.getdeptList(1);
      } else {
        this.clearDepartmentForm();
        this.toastr.error(res['message'], 'Error!')
      }
    }, () => {
      this.clearDepartmentForm();
      this.toastr.error('Something went wrong', 'Error!')
    });
  }

  clearDepartmentForm() {
    $("#editDeptModal").modal('hide');
    $("#addDeptModal").modal('hide');
    this.departmentForm.reset();
    this.formInit(this.orgId);
  }

  editDept(deptData: Department) {
    this.departmentForm.reset();
    if (deptData) {
      this.deptId = deptData['_id'];
      this.branch = deptData['branch'];
      this.departmentForm.patchValue({
        name: deptData['name'],
        organization: deptData['organization']['_id']
      });
      $("#editDeptModal").modal('show');
    }
  }

  updateDept(formValue) {
    formValue['branch'] = this.branch;
    this.editDeptSubscription = this.authService.updateDepartment(formValue, this.deptId).subscribe(res => {
      if (res['success']) {
        this.toastr.success('Department Edited', 'Success!');
        this.clearDepartmentForm();
        this.getdeptList(this.deptPaginator.skip);
      } else {
        this.clearDepartmentForm();
        this.toastr.error(res['message'], 'Error!')
      }
    }, () => {
      this.clearDepartmentForm();
      this.toastr.error('Something went wrong', 'Error!')
    });
  }


  delete(department: Department) {
    if (department) {
      this.deptId = department['_id'];
      this.departmentName = department['name'];
      $("#deleteModal").modal('show');
    }
  }

  deleteDepartment() {
    this.deleteDepartmentSubscription = this.authService.deleteDepartment(this.deptId).subscribe(res => {
      if (res['success']) {
        this.toastr.success('Department Deleted', 'Success!');
        $("#deleteModal").modal('hide');
        this.getdeptList(this.deptPaginator.skip);
      } else {
        this.toastr.error(res['message'], 'Error!')
      }
    },
      () => {
        this.toastr.error('Something went wrong', 'Error!')
      });
  }

  openDepartmentPopUp() {
    this.departmentForm.patchValue({ organization: this.orgId, name: '' });
    $("#addDeptModal").modal('show');
  }
}

