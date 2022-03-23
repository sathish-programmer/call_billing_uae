import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../auth/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { OrganizationIdSharingService } from '../../../service/data.service';
import * as _ from 'underscore';
import { Subscription } from 'rxjs';
declare let $: any;

@Component({
  selector: 'app-create-role',
  templateUrl: './manage-role.component.html',
  styleUrls: ['./manage-role.component.scss']
})
export class ManageRoleComponent implements OnInit {
  sharingSubscription: Subscription;
  masterRoleListSubscription: Subscription;
  addRoleSubscription: Subscription;
  editRoleSubscription: Subscription;
  roleForm: FormGroup;
  orgId: string;
  permissions: any = [];
  roleList: string[] = [];
  masterRoleList = [];
  roleAction: any;
  list: any;
  roleDataToEdit: any;

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
      this.setFormValues();
    });
  }

  ngAfterViewInit(): void {
    let that = this;

    setTimeout(function () {
      that.orgId = $("#org-dropdown-navbar").attr('value');

      if (that.orgId) {
        that.formInit(that.orgId);
        that.setFormValues();
      }
    }, 300);
  }

  ngOnInit(): void {
    this.permissions = JSON.parse(localStorage.getItem("permissions"));
    this.roleAction = localStorage.getItem("roleAction");
    if (this.roleAction == 'edit') {
      this.roleDataToEdit = JSON.parse(localStorage.getItem("roleToEdit"));
    }

    this.getMasterRoleList();
  }

  ngOnDestroy():void {
    this.sharingSubscription.unsubscribe();
    this.masterRoleListSubscription.unsubscribe();
    this.addRoleSubscription?.unsubscribe();
    this.editRoleSubscription?.unsubscribe();
  }

  formInit(organization: string) {
    this.roleForm = this.fb.group({
      organization: [organization, Validators.required],
      name: ['', Validators.required],
      description: [''],
      list: ['', Validators.required]
    });
  }

  setFormValues() {
    if (this.roleAction == 'edit') {
      this.roleDataToEdit = JSON.parse(localStorage.getItem("roleToEdit"));

      this.roleForm.patchValue({
        name: this.roleDataToEdit['name'],
        description: this.roleDataToEdit['description'],
        organization: this.roleDataToEdit['organization']['_id']
      });
    }
  }

  getMasterRoleList() {
    this.masterRoleListSubscription = this.authService.getMasterRoleList().subscribe(res => {
      if(res['success']){
        this.list = res['data'];
        this.setSelectedValue(this.roleDataToEdit, this.roleAction);
      } else {
        this.toastr.error(res['message'], 'Error!')
      }
      }, () => {
      this.toastr.error('Something went wrong', 'Error!')
    });
  }

  setSelectedValue(roleDataToEdit, roleAction) {
    this.masterRoleList = this.list.map(function (val) {
      let data = { name: val.name, permissions: '' };

      data.permissions = val.permissions.map(function (permission) {

        if (roleAction == 'edit') {
          if (_.contains(roleDataToEdit['list'], permission)) {
            return { name: permission, selected: true };
          } else {
            return { name: permission, selected: false };
          }
        } else {
          return { name: permission, selected: false };
        }
      });

      return data;
    });
  }

  createUpdateRole(formValue) {
    console.log(formValue)
    this.roleList = _.chain(this.masterRoleList).pluck('permissions').reduceRight(function (a, b) { return a.concat(b); }, []).where({ selected: true }).pluck('name').value();
    formValue['list'] = this.roleList;
    console.log(this.roleList)
    console.log(formValue)
    if (this.roleAction == 'add') {
      this.addRoleSubscription = this.authService.addRole(formValue).subscribe(res => {
        this.clearRoleForm();
        if (res['success']) {
          this.toastr.success(res['message'], 'Success!');
        } else {
          this.toastr.error(res['message'], 'Error!')
        }
      }, () => {
        this.clearRoleForm();
        this.toastr.error('Something went wrong', 'Error!')
      });
    } else {
      this.editRoleSubscription = this.authService.editRole(formValue, this.roleDataToEdit['_id']).subscribe(res => {
        this.clearRoleForm();
        if (res['success']) {
          this.toastr.success(res['message'], 'Success!');
        } else {
          this.toastr.error(res['message'], 'Error!')
        }
      }, () => {
        this.clearRoleForm();
        this.toastr.error('Something went wrong', 'Error!')
      });
    }
  }

  clearRoleForm() {
    this.roleForm.reset();
    this.formInit(this.orgId);
    this.router.navigate(['admin/role'])
  }
}