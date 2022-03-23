import { AfterViewInit, Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { ToastrService } from 'ngx-toastr';
import { SubDepartment } from '../../models/sub-department.model';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { OrganizationIdSharingService } from '../../service/data.service';
import { Subscription } from 'rxjs';
import { Department } from '../../models/department.model';
import { SubDepartmentModule } from './sub-department.module';
declare let $: any;

@Component({
  selector: 'app-sub-department',
  templateUrl: './sub-department.component.html',
  styleUrls: ['./sub-department.component.scss']
})
export class SubDepartmentComponent implements OnInit, AfterViewInit, OnDestroy {
  sharingSubscription: Subscription;
  deptListSubscription: Subscription;
  addSubDeptSubscription: Subscription;
  editSubDeptSubscription: Subscription;
  deleteSubDeptSubscription: Subscription;
  subDeptListSubscription: Subscription;
  subDeptForm: FormGroup;
  deptList: Department[];
  subDeptList: SubDepartment;
  orgId: string;
  subDeptId: string;
  permissions: any = [];
  subDeptName: any;
  subDeptPaginator = { limit: 10, skip: 1, total: 0 }

  constructor(private authService: AuthService,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private sharingService: OrganizationIdSharingService) {

    $("#org-dropdown-navbar").prop("disabled", false);
    this.formInit('');
    this.sharingSubscription = this.sharingService.currentOrgId.subscribe(orgId => {
      this.orgId = orgId;
      this.formInit(orgId);
      this.getDeptList(1);
      this.getSubDeptList(1);
    });
  }

  ngAfterViewInit(): void {
    let that = this;

    setTimeout(function () {
      that.orgId = $("#org-dropdown-navbar").attr('value');

      if (that.orgId) {
        that.formInit(that.orgId);
        that.getDeptList(1);
        that.getSubDeptList(1);
      }
    }, 300);
  }

  ngOnInit(): void {
    this.permissions = JSON.parse(localStorage.getItem("permissions"));
  }

  ngOnDestroy(): void {
    this.sharingSubscription.unsubscribe();
    this.deptListSubscription.unsubscribe();
    this.addSubDeptSubscription?.unsubscribe();
    this.editSubDeptSubscription?.unsubscribe();
    this.subDeptListSubscription.unsubscribe();
  }

  formInit(organization: string) {
    this.subDeptForm = this.fb.group({
      organization: [organization, Validators.required],
      name: ['', Validators.required],
      department: ['', Validators.required]
    });
  }

  getSubDeptList(skip) {
    this.subDeptForm.patchValue({ organization: this.orgId });
    this.subDeptPaginator.skip = skip;
    let dataToSend = {
      skip: this.subDeptPaginator.skip,
      limit: this.subDeptPaginator.limit,
    };
    this.subDeptListSubscription = this.authService.getSubDeptList(this.orgId, dataToSend).subscribe(res => {
      if (res['success']) {
        this.subDeptList = res['data'];
        this.subDeptPaginator.total = res["total"];
      } else {
        this.toastr.error(res['message'], 'Error!')
      }
    }, () => {
      this.toastr.error('Something went wrong', 'Error!')
    });
  }

  getDeptList(skip) {
    this.deptListSubscription = this.authService.getDepartmentList(this.orgId).subscribe(res => {
      if (res['success']) {
        this.deptList = res['data'];
      } else {
        this.toastr.error(res['message'], 'Error!')
      }
    }, () => {
      this.toastr.error('Something went wrong', 'Error!')
    });
  }

  addSubDept(formValue) {
    this.addSubDeptSubscription = this.authService.addSubDepartment(formValue).subscribe(res => {
      if (res['success']) {
        this.toastr.success(res['message'], 'Success!');
        this.clearSubDeptForm();
        this.getSubDeptList(1);
      } else {
        this.clearSubDeptForm();
        this.toastr.error(res['message'], 'Error!')
      }
    }, () => {
      this.clearSubDeptForm();
      this.toastr.error('Something went wrong', 'Error!')
    });
  }

  clearSubDeptForm() {
    $("#editSubDeptModal").modal('hide');
    $("#addSubDeptModal").modal('hide');
    this.subDeptForm.reset();
    this.formInit(this.orgId);
  }

  editSubDept(subDeptData: SubDepartment) {
    this.subDeptForm.reset();
    if (subDeptData) {
      this.subDeptId = subDeptData['_id'];
      this.subDeptForm.patchValue({
        name: subDeptData['name'],
        department: subDeptData['department']['_id'],
        organization: subDeptData['organization']['_id']
      });
      $("#editSubDeptModal").modal('show');
    }
  }

  updateSubDept(formValue) {
    this.editSubDeptSubscription = this.authService.updateSubDepartment(formValue, this.subDeptId).subscribe(res => {
      if (res['success']) {
        this.toastr.success('Sub-Department Edited', 'Success!');
        this.clearSubDeptForm();
        this.getSubDeptList(this.subDeptPaginator.skip);
      } else {
        this.clearSubDeptForm();
        this.toastr.error(res['message'], 'Error!')
      }
    }, () => {
      this.clearSubDeptForm();
      this.toastr.error('Something went wrong', 'Error!')
    });
  }


  delete(data: SubDepartment) {
    if (data) {
      this.subDeptId = data['_id'];
      this.subDeptName = data['name'];
      $("#deleteModal").modal('show');
    }
  }

  deleteSubDepartment() {
    this.deleteSubDeptSubscription = this.authService.deleteSubDepartment(this.subDeptId).subscribe(res => {
      if (res['success']) {
        this.toastr.success('Sub-Department Deleted', 'Success!');
        $("#deleteModal").modal('hide');
        this.getSubDeptList(this.subDeptPaginator.skip);
      } else {
        this.toastr.error(res['message'], 'Error!')
      }
    },
      () => {
        this.toastr.error('Something went wrong', 'Error!')
      });
  }

  openSubDepartmentPopUp() {
    this.subDeptForm.patchValue({ organization: this.orgId, name: '' });
    $("#addSubDeptModal").modal('show');
  }
}


