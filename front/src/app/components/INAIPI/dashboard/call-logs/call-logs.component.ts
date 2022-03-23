import { AfterViewInit, Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../../../auth/auth.service';
import { ToastrService } from 'ngx-toastr';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { OrganizationIdSharingService } from '../../../../service/data.service';
import { Branch } from '../../../../models/branch.model';
import { Timezone } from '../../../../models/timezone.model';
import { Country } from '../../../../models/country.model';
import { Subscription } from 'rxjs';
import { CallLogs } from 'src/app/models/callLogs.model';
declare let $: any;

@Component({
  selector: 'app-call-logs',
  templateUrl: './call-logs.component.html',
  styleUrls: ['./call-logs.component.scss']
})
export class CallLogsComponent implements OnInit {
  callLogsSubscription: Subscription;
  sharingSubscription: Subscription
  callLogsList: CallLogs[];
  orgId: string;
  permissions: any = [];
  callLogsPaginator = { limit: 10, skip: 1, total: 0 }

  constructor(private authService: AuthService,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private sharingService: OrganizationIdSharingService) {

    $("#org-dropdown-navbar").prop("disabled", false);

    this.sharingSubscription = this.sharingService.currentOrgId.subscribe(orgId => {
      this.orgId = orgId;
      this.getcallLogsList(1);
    });
  }

  ngAfterViewInit(): void {
    let that = this;

    setTimeout(function () {
      that.orgId = $("#org-dropdown-navbar").attr('value');

      if (that.orgId) {
        that.getcallLogsList(1);
      }
    }, 300);
  }

  ngOnInit(): void {
    this.permissions = JSON.parse(localStorage.getItem("permissions"));
  }

  ngOnDestroy(): void {
    this.sharingSubscription.unsubscribe();
    this.callLogsSubscription.unsubscribe();
  }

  getcallLogsList(skip) {
    this.callLogsPaginator.skip = skip;
    let dataToSend = {
      skip: this.callLogsPaginator.skip,
      limit: this.callLogsPaginator.limit,
    };
    console.log("data to send", dataToSend);
    console.log("orgID__________", this.orgId);
    this.callLogsSubscription = this.authService.getCallLogs(this.orgId, dataToSend).subscribe(res => {
      console.log("call logs______________", res);
      if (res['success']) {
        this.callLogsList = res['data'];
        this.callLogsPaginator.total = res["total"];
      } else {
        this.toastr.error(res['message'], 'Error!')
      }
    }, () => {
      this.toastr.error('Something went wrong', 'Error!')
    });
  }

}