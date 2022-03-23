import { Component, AfterViewInit, OnInit } from '@angular/core';
import { AuthService } from '../../../auth/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { OrganizationIdSharingService } from '../../../service/data.service';
import * as _ from 'underscore';
import { Timezone } from '../../../models/timezone.model';
import { Country } from '../../../models/country.model';
import { Organization } from '../../../models/organization.model';
import { Roles } from '../../../models/role.model';
import { Branch } from '../../../models/branch.model';
import { Department } from '../../../models/department.model';
import { Subscription } from 'rxjs';
import { SubDepartment } from 'src/app/models/sub-department.model';
declare let $: any;

@Component({
  selector: 'app-create-user',
  templateUrl: './manage-user.component.html',
  styleUrls: ['./manage-user.component.scss']
})
export class ManageUserComponent implements OnInit, AfterViewInit {
  sharingSubscription: Subscription;
  timezoneSubscription: Subscription;
  countrySubscription: Subscription;
  orgListSubscription: Subscription;
  rolesSubscription: Subscription;
  branchesSubscription: Subscription;
  deptSubscription: Subscription;
  subDeptSubscription: Subscription;
  addUserSubscription: Subscription;
  editUserSubscription: Subscription;
  userForm: FormGroup;
  orgId: string;
  permissions: any = [];
  timezoneList: Timezone[];
  countryList: Country[];
  orgList: Organization[];
  rolesList: Roles[];
  branchList: Branch[];
  deptList: Department[];
  subDeptList: SubDepartment[];
  userAction: any;
  userDataToEdit: any;
  enableLogin = true;

  constructor(private authService: AuthService,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private sharingService: OrganizationIdSharingService,
    private router: Router) {

    $("#org-dropdown-navbar").prop("disabled", true);

    this.formInit('');
    this.sharingSubscription = this.sharingService.currentOrgId.subscribe(orgId => {
      this.orgId = orgId;
      this.formInit(orgId);
      this.getLists();
      this.setFormValues();
    });
  }

  ngAfterViewInit(): void {
    let that = this;

    setTimeout(function () {
      that.orgId = $("#org-dropdown-navbar").attr('value');

      if (that.orgId) {
        that.formInit(that.orgId);
        that.getLists();
        that.setFormValues();
      }
    }, 300);
  }

  ngOnInit(): void {
    this.permissions = JSON.parse(localStorage.getItem("permissions"));
    this.userAction = localStorage.getItem("userAction");
    if (this.userAction == 'edit') {
      this.userDataToEdit = JSON.parse(localStorage.getItem("userToEdit"));
    }
  }

  ngOnDestroy(): void {
    this.sharingSubscription.unsubscribe();
    this.timezoneSubscription.unsubscribe();
    this.countrySubscription.unsubscribe();
    this.orgListSubscription?.unsubscribe();
    this.rolesSubscription?.unsubscribe();
    this.branchesSubscription?.unsubscribe();
    this.deptSubscription?.unsubscribe();
    this.subDeptSubscription?.unsubscribe();
    this.addUserSubscription?.unsubscribe();
    this.editUserSubscription?.unsubscribe();
  }

  formInit(organization: string) {
    this.userForm = this.fb.group({
      organization: [organization, Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', Validators.required],
      enableLogin: [false],
      password: [''],
      country: [''],
      timeZone: [''],
      extension: ['', Validators.maxLength(6)],
      role: ['', Validators.required],
      branch: ['', Validators.required],
      department: ['', Validators.required],
      subdepartment: ['']
    });
  }

  setFormValues() {
    if (this.userAction == 'edit') {
      this.userDataToEdit = JSON.parse(localStorage.getItem("userToEdit"));
      this.userForm.patchValue({
        firstName: this.userDataToEdit['firstName'],
        lastName: this.userDataToEdit['lastName'],
        email: this.userDataToEdit['email'],
        enableLogin: this.userDataToEdit['enableLogin'],
        extension: this.userDataToEdit['extension'],
        country: this.userDataToEdit['country']['_id'],
        timeZone: this.userDataToEdit['timeZone']['_id'],
        role: this.userDataToEdit['role']['_id'],
        organization: this.userDataToEdit['organization']['_id']
      });
      if (this.userDataToEdit['branch']['_id']) {
        this.userForm.patchValue({ branch: this.userDataToEdit['branch']['_id'] })
      } else {
        this.userForm.patchValue({ branch: this.userDataToEdit['branch'] })
      }
      if (this.userDataToEdit['department']['_id']) {
        this.userForm.patchValue({ department: this.userDataToEdit['department']['_id'] })
      } else {
        this.userForm.patchValue({ department: this.userDataToEdit['department'] })
      }
      console.log(this.userDataToEdit);
      if (this.userDataToEdit['subdepartment']?.this.userDataToEdit['subdepartment']['_id']) {
        this.userForm.patchValue({ subdepartment: this.userDataToEdit['subdepartment']['_id'] })
      } else {
        this.userForm.patchValue({ subdepartment: this.userDataToEdit['subdepartment'] })
      }
    }
  }

  getLists() {
    this.timezoneSubscription = this.authService.getTimezones().subscribe(res => {
      if (res['success']) {
        this.timezoneList = res['data'];
      } else {
        this.toastr.error(res['message'], 'Error!')
      }
    }, () => {
      this.toastr.error('Something went wrong', 'Error!')
    });

    this.countrySubscription = this.authService.getCountries().subscribe(res => {
      if (res['success']) {
        this.countryList = res['data'];
      } else {
        this.toastr.error(res['message'], 'Error!')
      }
    }, () => {
      this.toastr.error('Something went wrong', 'Error!')
    });

    this.orgListSubscription = this.authService.getOrganizationList().subscribe(res => {
      if (res['success']) {
        this.orgList = res['data'];
      }
    });

    this.subDeptSubscription = this.authService.getSubDeptList(this.orgId).subscribe(res => {
      if (res['success']) {
        this.subDeptList = res['data'];
      } else {
        this.toastr.error(res['message'], 'Error!')
      }
    }, () => {
      this.toastr.error('Something went wrong', 'Error!')
    });
    this.getRoleBranchDept(this.orgId);
  }

  changeBranch(value) {
    this.userForm.patchValue({ department: [''] });
    if (value == 'all') {
      this.deptSubscription = this.authService.getDepartmentList(this.orgId).subscribe(res => {
        if (res['success']) {
          this.deptList = res['data'];
        } else {
          this.toastr.error(res['message'], 'Error!')
        }
      }, () => {
        this.toastr.error('Something went wrong', 'Error!')
      });
    } else {
      this.deptSubscription = this.authService.getDepartmentList(this.orgId, "", value).subscribe(res => {
        if (res['success']) {
          this.deptList = res['data'];
        } else {
          this.toastr.error(res['message'], 'Error!')
        }
      }, () => {
        this.toastr.error('Something went wrong', 'Error!')
      });
    }
  }

  getRoleBranchDept(id) {
    this.rolesSubscription = this.authService.getRolesList(id).subscribe(res => {
      if (res['success']) {
        this.rolesList = res['data'];
      } else {
        this.toastr.error(res['message'], 'Error!')
      }
    }, () => {
      this.toastr.error('Something went wrong', 'Error!')
    });

    this.branchesSubscription = this.authService.getBranchList(id).subscribe(res => {
      if (res['success']) {
        this.branchList = res['data'];
      } else {
        this.toastr.error(res['message'], 'Error!')
      }
    }, () => {
      this.toastr.error('Something went wrong', 'Error!')
    });

    this.deptSubscription = this.authService.getDepartmentList(id).subscribe(res => {
      if (res['success']) {
        this.deptList = res['data'];
      } else {
        this.toastr.error(res['message'], 'Error!')
      }
    }, () => {
      this.toastr.error('Something went wrong', 'Error!')
    });
  }

  createUpdateUser(formValue) {
    if (this.userAction == 'add') {
      console.log(formValue)
      this.addUserSubscription = this.authService.addUser(formValue).subscribe(res => {
        this.clearUserForm();
        if (res['success']) {
          this.toastr.success(res['message'], 'Success!');
        } else {
          this.toastr.error(res['message'], 'Error!')
        }
      }, () => {
        this.clearUserForm();
        this.toastr.error('Something went wrong', 'Error!')
      });
    } else {
      this.editUserSubscription = this.authService.editUser(formValue, this.userDataToEdit['_id']).subscribe(res => {
        this.clearUserForm();
        if (res['success']) {
          this.toastr.success(res['message'], 'Success!');
        } else {
          this.toastr.error(res['message'], 'Error!')
        }
      }, () => {
        this.clearUserForm();
        this.toastr.error('Something went wrong', 'Error!')
      });
    }
  }

  clearUserForm() {
    this.userForm.reset();
    this.formInit(this.orgId);
    this.router.navigate(['admin/user']);
  }

  numberOnly(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }
}