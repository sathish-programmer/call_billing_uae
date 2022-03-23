import { AuthService } from 'src/app/auth/auth.service';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { environment } from "../../../environments/environment";
import { HttpClient, HttpHeaders } from '@angular/common/http';


import * as moment from 'moment';
import { from } from 'rxjs';
@Component({
  selector: 'app-support',
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.scss']
})


export class SupportComponent implements OnInit {

  contactForm: FormGroup;
  message: boolean=false;
  supportApi = environment.urlForPhpApis;
  getLoginUsername: String;
  getLoginFullname: String;
  selectedValue: string = '';
  savedDateChangeEvent;
  todayDateToShow;
  validationMaxDate = moment();
  config = {
    max: this.validationMaxDate
  }

  constructor(private http:HttpClient, private toastr: ToastrService,) { }

  ngOnInit(): void {
    this.getLoginUsername = localStorage.getItem("email");
    this.getLoginFullname = localStorage.getItem("firstName");
  }

  createTicket(data){
    data['apiuser'] = this.getLoginUsername;
    
    data['email'] = this.getLoginUsername;

    const userOrgName = $('#org-dropdown-navbar').html().trim();
    data['username'] = userOrgName;
    if(this.selectedValue == 'Bug'){
      data['priority'] = 'High';
      data['issue_date'] = this.todayDateToShow;
    }else{
      data['priority'] = 'Medium';
      data['issue_date'] = '';
      data['issue_prevent'] = '';
      data['problem_category'] = '';
    }

    const new_data = JSON.stringify(data);

    // console.log(new_data)
    this.http.post(this.supportApi+'inaipi/insert_ticket_api', new_data)
    .subscribe((result)=>{
      this.message = true;
      if (result['success']) {
        this.toastr.success('Support raised successfully', 'Success!');
        this.clearForm();
      } else {
        this.toastr.error('Error, Try again after some times', 'Error!')
      }
    }, () => {
      this.toastr.error('Something went wrong', 'Error!');
    })
  }

  dateChange(event) {
    this.savedDateChangeEvent = event.date._d;
    console.log(this.savedDateChangeEvent)
    this.todayDateToShow = moment(this.savedDateChangeEvent).format('DD-MM-YYYY');
    console.log('today: '+this.todayDateToShow)
  }

  // clear form after success
  clearForm(){
    (<HTMLFormElement>document.getElementById("supportTicket")).reset();
    this.selectedValue = '';
  }
}
