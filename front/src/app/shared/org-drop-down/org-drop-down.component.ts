import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../auth/auth.service';
import { Organization } from '../../models/organization.model';
import * as _ from "underscore";
import { Subscription } from 'rxjs';
import { OrganizationIdSharingService } from 'src/app/service/data.service';

declare var $: any;

@Component({
  selector: 'app-org-drop-down',
  templateUrl: './org-drop-down.component.html',
  styleUrls: ['./org-drop-down.component.scss']
})

export class OrgDropDownComponent implements OnInit, OnDestroy {
  @Output() sendOrgId = new EventEmitter<string>()
  menuItems: any;
  sharingSubscription: Subscription;
  orgList: Organization[];
  selectedOrg: Organization = { _id: '', name: '' };
  userOrganization: string;
  searchOrg: string = '';

  constructor(private router: Router,
    private authService: AuthService,
    private toastr: ToastrService, private sharingService: OrganizationIdSharingService) {
    this.sharingSubscription = this.sharingService.currentOrgList.subscribe(orgList => {
      if (orgList) {
        this.getOrganizationList();
      }
    });
  }

  ngOnInit() {
    this.userOrganization = localStorage.getItem("organization");
    this.getOrganizationList();
    let that = this;
    $(".dropdown").hover(
      function () {
      }, function () {
        that.removeClass()
      }
    );
  }

  ngOnDestroy() { }

  getOrganizationList() {
    this.authService.getOrganizationList().subscribe(res => {
      if (res['success']) {
        this.orgList = res['data'];
        let userOrg = _.findWhere(this.orgList, { _id: this.userOrganization });

        if (userOrg) {
          this.selectOrg(userOrg);
        }
      } else {
        this.toastr.error('Something went wrong.', 'No org found')
      }
    },
      (err) => {
        this.toastr.error('Something went wrong', 'No org found')
      });
  }

  selectOrg(orgData) {
    this.selectedOrg = orgData;
    this.searchOrg = '';
    this.sendOrgId.emit(orgData._id);
    this.removeClass();
  }

  removeClass() {
    $(".dropdown").removeClass("showContent");
    $(".dropdown-content").removeClass("showContent");
  }

  toggleClass() {
    $(".dropdown").toggleClass("showContent");
    $(".dropdown-content").toggleClass("showContent");
  }
}


//$("#org-dropdown-navbar").prop("disabled", true);