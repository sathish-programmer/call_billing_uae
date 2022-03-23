import { AfterViewInit, Component, Input, OnChanges, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Department } from '../../models/department.model';
import { AuthService } from '../../auth/auth.service';
import { ToastrService } from 'ngx-toastr';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { OrganizationIdSharingService } from '../../service/data.service';
import { Subscription } from 'rxjs';
import { Roles } from 'src/app/models/role.model';
declare let $: any;

@Component({
  selector: 'app-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.scss']
})
export class RoleComponent implements OnInit {
  sharingSubscription: Subscription;
  rolesListSubscription: Subscription;
  deleteRoleSubscription: Subscription;
  permissions: [] = [];
  roleList: [] = [];
  orgId: string;
  roleId: any;
  roleName: any;
  rolesPaginator = { limit: 10, skip: 1, total: 0 }

  constructor(private sharingService: OrganizationIdSharingService,
    private authService: AuthService,
    private toastr: ToastrService,
    private router: Router) {

    $("#org-dropdown-navbar").prop("disabled", false);
    this.sharingSubscription = this.sharingService.currentOrgId.subscribe(orgId => {
      this.orgId = orgId;
      this.getRolesList(1);
    });
  }

  ngAfterViewInit(): void {
    let that = this;

    setTimeout(function () {
      that.orgId = $("#org-dropdown-navbar").attr('value');

      if (that.orgId) {
        that.getRolesList(1);
      }
    }, 300);
  }

  ngOnInit(): void {
    this.permissions = JSON.parse(localStorage.getItem("permissions"));
  }

  ngOnDestroy(): void {
    this.sharingSubscription.unsubscribe();
    this.rolesListSubscription.unsubscribe();
    this.deleteRoleSubscription?.unsubscribe();
  }

  getRolesList(skip) {
    this.rolesPaginator.skip = skip;
    let dataToSend = {
      skip: this.rolesPaginator.skip,
      limit: this.rolesPaginator.limit,
    };
    this.rolesListSubscription = this.authService.getRolesList(this.orgId, dataToSend).subscribe(res => {
      if (res['success']) {
        this.roleList = res['data'];
      } else {
        this.toastr.error(res['message'], 'Error!')
      }
    }, () => {
      this.toastr.error('Something went wrong', 'Error!')
    });
  }

  setRoleAction(value, data?) {
    localStorage.setItem("roleAction", value);
    localStorage.setItem("roleToEdit", JSON.stringify(data));
    this.router.navigate(['admin/role/manage']);
  }

  delete(role: Roles) {
    if (role) {
      this.roleId = role['_id'];
      this.roleName = role['name'];
      $("#deleteModal").modal('show');
    }
  }

  deleteRole() {
    this.deleteRoleSubscription = this.authService.deleteRole(this.roleId).subscribe(res => {
      if (res['success']) {
        this.toastr.success('Role Deleted', 'Success!');
        $("#deleteModal").modal('hide');
        this.getRolesList(this.rolesPaginator.skip);
      } else {
        this.toastr.error(res['message'], 'Error!')
      }
    },
      () => {
        this.toastr.error('Something went wrong', 'Error!')
      });
  }
}