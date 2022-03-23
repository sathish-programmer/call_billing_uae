import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { ToastrService } from 'ngx-toastr';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { OrganizationIdSharingService } from '../../service/data.service';
import { Timezone } from '../../models/timezone.model';
import { Country } from '../../models/country.model';
import { User } from '../../models/user.model';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { unsupported } from '@angular/compiler/src/render3/view/util';
declare let $: any;

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit, AfterViewInit, OnDestroy {
  sharingSubscription: Subscription;
  userListSubscription: Subscription;
  dataProviderUserListSubscription: Subscription;
  deleteUserSubscription: Subscription;
  createTokenSubscription: Subscription;
  userForm: FormGroup;
  userList: User[];
  dataProviderUser: User[] = [];
  orgId: string;
  userId: string;
  userName: any;
  permissions: any = [];
  tabValue = 1;
  userPaginator = { limit: 10, skip: 1, total: 0 };
  isSU = localStorage.getItem('isSU');

  constructor(private authService: AuthService,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private sharingService: OrganizationIdSharingService,
    private router: Router) {

    $("#org-dropdown-navbar").prop("disabled", false);
    this.formInit('');

    this.sharingSubscription = this.sharingService.currentOrgId.subscribe(orgId => {
      this.orgId = orgId;
      this.getUserList(1, this.tabValue);
      this.getDataProviderUserList(this.tabValue);
      this.formInit(orgId);
    });
  }

  ngAfterViewInit(): void {
    let that = this;

    setTimeout(function () {
      that.orgId = $("#org-dropdown-navbar").attr('value');

      if (that.orgId) {
        that.formInit(that.orgId);
        that.getUserList(1, 1);
        that.getDataProviderUserList(1)
      }
    }, 300);
  }

  ngOnInit(): void {
    this.formInit('');
    this.permissions = JSON.parse(localStorage.getItem("permissions"));
  }

  ngOnDestroy(): void {
    this.sharingSubscription.unsubscribe();
    this.userListSubscription.unsubscribe();
    this.dataProviderUserListSubscription?.unsubscribe();
    this.deleteUserSubscription?.unsubscribe();
    this.createTokenSubscription?.unsubscribe();
  }

  formInit(organization) {
    this.userForm = this.fb.group({
      organization: [organization, Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      timeZone: ['', Validators.required],
      country: ['', Validators.required],
    });
  }

  getUserList(skip, tabvalue) {
    this.tabValue = tabvalue;

    this.userForm.patchValue({ organization: this.orgId });
    this.userPaginator.skip = skip;
    let dataToSend = {
      skip: this.userPaginator.skip,
      limit: this.userPaginator.limit,
    };
    this.userListSubscription = this.authService.getUserList(dataToSend, this.orgId).subscribe(res => {
      if (res['success']) {
        this.userPaginator.total = res["total"];
        this.userList = res['data'];
      } else {
        this.toastr.error(res['message'], 'Error!')
      }
    }, () => {
      this.toastr.error('Something went wrong', 'Error!')
    });
  }

  getDataProviderUserList(tabvalue) {
    this.tabValue = tabvalue;
    this.dataProviderUserListSubscription = this.authService.getDataProviderUserList(this.orgId).subscribe(res => {
      if (res['success']) {
        this.dataProviderUser = res['data'];
      } else {
        this.toastr.error(res['message'], 'Error!')
      }
    }, () => {
      this.toastr.error('Something went wrong', 'Error!')
    });
  }

  delete(userData: User) {
    if (userData) {
      this.userId = userData['_id'];
      this.userName = userData.firstName.charAt(0).toUpperCase() + userData.firstName.slice(1) + " " +
        userData.lastName.charAt(0).toUpperCase() + userData.lastName.slice(1);
      $("#deleteModal").modal('show');
    }
  }

  deleteUser() {
    this.deleteUserSubscription = this.authService.deleteUser(this.userId).subscribe(res => {
      if (res['success']) {
        this.toastr.success('User Deleted', 'Success!');
        $("#deleteModal").modal('hide');
        this.userForm.reset();
        this.getUserList(this.userPaginator.skip, 1);
      } else {
        this.toastr.error(res['message'], 'Error!')
      }
    }, () => {
      this.toastr.error('Something went wrong', 'Error!')
    });
  }

  setUserAction(value, data?) {
    localStorage.setItem("userAction", value);
    localStorage.setItem("userToEdit", JSON.stringify(data));
    this.router.navigate(['admin/user/manage']);
  }

  createToken(data) {
    this.createTokenSubscription = this.authService.createTokenDPUser(data._id).subscribe(res => {
      if (res['success']) {
        this.toastr.success('Token Created', 'Success!');
        this.getDataProviderUserList(2);
      } else {
        this.toastr.error(res['message'], 'Error!')
      }
    }, () => {
      this.toastr.error('Something went wrong', 'Error!')
    });
  }
}