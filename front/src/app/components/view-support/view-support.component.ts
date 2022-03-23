import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Support } from './../../models/support.model';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { environment } from "../../../environments/environment";
declare let $: any;
@Component({
  selector: 'app-view-support',
  templateUrl: './view-support.component.html',
  styleUrls: ['./view-support.component.scss']
})

export class ViewSupportComponent implements OnInit {
  ticketList: [] = [];
  message: boolean = false;
  supportList: Support[];
  // supportForm: FormGroup;
  supportId: string;
  supportRevokeDesc: String;
  revokeDesc: String = '';
  oldStatus: String;
  totalRecords: String;
  page: Number = 1;
  supportApi = environment.urlForPhpApis;
  getLoginUsername: String;

  supportPaginator = { limit: 10, skip: 1, total: 0 }

  constructor(
    private httpClient: HttpClient, 
    private toastr: ToastrService, 
    private router: Router,
    private fb: FormBuilder,
    ) { }
    

  ngOnInit(): void {
    this.getLoginUsername = localStorage.getItem("email");
    this.getTickets(1);
  }

  // intialize form group
  supportForm = this.fb.group({
    username: [{value:'username', disabled:true}],
    mobile_number: [{value:'mobile number', disabled:true}],
    subject: ['', Validators.required],
    description:['', Validators.required],
  });

  // get data from api
  getTickets(skip){
    let api_user = this.getLoginUsername;
    this.supportPaginator.skip = skip;
    let data = {'apiuser':api_user};
    // send login username in api
    let data_new = JSON.stringify(data);
    this.httpClient.post(this.supportApi+'admin/getTicketList_api', data_new).subscribe(
      res => {
        console.log(res);
        // if username found , get ticket records
        if(!res['status']){
          this.ticketList = res['result'];
          this.totalRecords = res['result'].length;
        }else{
          this.toastr.error("No support found for this user", 'Error!');
        }
      }, () => {
        this.toastr.error('Something went wrong', 'Error!');
      });
  }

  editSupport(supportData: Support) {
    this.supportForm.reset(); 
    if (supportData) {
      this.supportId = supportData['id'];
      this.supportForm.patchValue({
        username: supportData['username'],
        mobile_number: supportData['mobile_number'],
        subject: supportData['subject'],
        description: supportData['description'],
      });
      $("#editSupportModal").modal('show');
    }
  }

  updateSupport(formValue) {
    console.log(formValue)
    formValue["id"] = this.supportId;
    let id = this.supportId
      this.httpClient.post(this.supportApi+'admin/editTicket_api', formValue).subscribe(
      res => {
        if(res['status']){
          this.toastr.success('Support Updated', 'Success!');
          this.clearSupportForm();
          // refresh list data
          this.getTickets(1);
        }else{
          this.clearSupportForm();
          this.toastr.error('Something went wrong', 'Error!');
        }
      }, () => {
        this.toastr.error('Something went wrong', 'Error!');
      });
  }

  revokeModel(support: Support) {
    if (support) {
      this.supportId = support['id'];
      this.oldStatus = support['status'];
      $("#deleteModal").modal('show');
    }
  }

  // revoke support
  revokeSupport(){
    // convert data to json format
    var data = JSON.stringify({ "ticket_id": this.supportId, "resolution":this.revokeDesc, "status": "Closed", "old_status": this.oldStatus});
    console.log(data);
    this.httpClient.post(this.supportApi+'admin/updateStatus', data)
    .subscribe((result)=>{
      if (result['status']) {
        this.toastr.success('Support Revoked', 'Success!');
        // refresh list data
        this.getTickets(1);
        $("#deleteModal").modal('hide');
        // clear revoke desc
        this.revokeDesc = '';
      } else {
        this.toastr.error('Error, Try again after some times', 'Error!');
      }
    }, () => {
      this.toastr.error('Something went wrong', 'Error!');
    })
  }

  clearSupportForm() {
    $("#editSupportModal").modal('hide');    
    $("#addSupportModal").modal('hide');
    this.supportForm.reset();
  }

  setSupportAction(value, data?) {
    localStorage.setItem("supportAction", value);
    localStorage.setItem("supportToEdit", JSON.stringify(data));
    this.router.navigate(['admin/inaipi/dashboard/support']);
  }
}
