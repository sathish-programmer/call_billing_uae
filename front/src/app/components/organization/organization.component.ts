import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { Organization } from '../../models/organization.model';
import { AuthService } from '../../auth/auth.service';
import { ToastrService } from 'ngx-toastr';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { OrganizationIdSharingService } from '../../service/data.service';
import { Roles } from '../../models/role.model';
import { Subscription } from 'rxjs';
declare let $: any;

@Component({
  selector: 'app-organization',
  templateUrl: './organization.component.html',
  styleUrls: ['./organization.component.scss'],
})
export class OrganizationComponent implements OnInit, OnDestroy {
  @Output() sendOrgList = new EventEmitter<Organization[]>();

  orgListSubscriptiion: Subscription;
  addOrgSubscription: Subscription;
  editOrgSubscription: Subscription;
  deleteOrgSubscription: Subscription;
  organizationForm: FormGroup;
  parentOrgList: Organization[];
  orgList: Organization[];
  orgChildList: Organization[];
  orgId: any;
  orgName: any;
  permissions: [] = [];
  orgPaginator = { limit: 10, skip: 1, total: 0 };

  constructor(
    private authService: AuthService,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private sharingService: OrganizationIdSharingService
  ) {}

  ngOnInit(): void {
    this.formInit();
    this.getOrgList(1);
    this.getOrganizations();

    this.permissions = JSON.parse(localStorage.getItem('permissions'));
    $('#org-dropdown-navbar').prop('disabled', true);
  }

  ngOnDestroy(): void {
    $('#org-dropdown-navbar').prop('disabled', false);
    this.orgListSubscriptiion.unsubscribe();
    this.addOrgSubscription?.unsubscribe();
    this.editOrgSubscription?.unsubscribe();
    this.deleteOrgSubscription?.unsubscribe();
  }

  formInit() {
    this.organizationForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      parent: ['', Validators.required],
    });
  }

  getOrganizations() {
    this.authService.getOrganizations().subscribe(
      (res) => {
        if (res['success']) {
          this.orgList = res['data'];
        } else {
          this.toastr.error(res['message'], 'Error!');
        }
      },
      () => {
        this.toastr.error('Something went wrong', 'Error!');
      }
    );
  }

  getOrgList(skip) {
    this.orgPaginator.skip = skip;
    let dataToSend = {
      skip: this.orgPaginator.skip,
      limit: this.orgPaginator.limit,
    };
    this.orgListSubscriptiion = this.authService
      .getOrganizationList(dataToSend)
      .subscribe(
        (res) => {
          if (res['success']) {
            this.parentOrgList = res['data'];
            this.orgPaginator.total = res['total'];
          } else {
            this.toastr.error(res['message'], 'Error!');
          }
        },
        () => {
          this.toastr.error('Something went wrong', 'Error!');
        }
      );
  }

  addOrg() {
    this.addOrgSubscription = this.authService
      .addOrganization(this.organizationForm.value)
      .subscribe(
        (res) => {
          console.log(this.organizationForm.value);
          if (res['success']) {
            this.toastr.success(res['message'], 'Success!');
            $('#addOrgModal').modal('hide');
            this.organizationForm.reset();
            this.getOrganizations();
            this.changeOrgList();
          } else {
            this.toastr.error(res['message'], 'Error!');
          }
        },
        () => {
          this.toastr.error('Something went wrong', 'Error!');
        }
      );
  }

  editOrg(orgData: Organization) {
    if (orgData) {
      this.orgId = orgData['_id'];
      this.organizationForm.patchValue({
        name: orgData['name'],
        description: orgData['description'],
        parent: orgData['parent'],
      });
      $('#editOrgModal').modal('show');
    }
  }

  updateOrg() {
    this.editOrgSubscription = this.authService
      .updateOrganization(this.organizationForm.value, this.orgId)
      .subscribe(
        (res) => {
          if (res['success']) {
            this.toastr.success('Organization Edited', 'Success!');
            $('#editOrgModal').modal('hide');
            this.organizationForm.reset();
            this.getOrganizations();
            this.changeOrgList();
          } else {
            this.toastr.error(res['message'], 'Error!');
          }
        },
        () => {
          this.toastr.error('Something went wrong', 'Error!');
        }
      );
  }

  deleteOrg(orgData: Organization) {
    if (orgData) {
      this.orgId = orgData['_id'];
      this.orgName = orgData['name'];
      $('#deleteModal').modal('show');
    }
  }

  deleteOrganization() {
    this.deleteOrgSubscription = this.authService
      .deleteOrganization(this.orgId)
      .subscribe(
        (res) => {
          if (res['success']) {
            this.toastr.success('Organization Deleted', 'Success!');
            $('#deleteModal').modal('hide');
            this.organizationForm.reset();
            this.getOrganizations();
            this.changeOrgList();
          } else {
            this.toastr.error(res['message'], 'Error!');
          }
        },
        () => {
          this.toastr.error('Something went wrong', 'Error!');
        }
      );
  }

  listChilds(childOrgList: Organization[]) {
    if (childOrgList && childOrgList.length) {
      this.orgChildList = childOrgList;
      $('#orgChildList').modal('show');
    }
  }

  changeOrgList() {
    this.sharingService.changeOrgList(true);
  }

  openOrganizationPopUp() {
    this.organizationForm.reset();
    $('#addOrgModal').modal('show');
  }
}
