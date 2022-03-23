import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-subscription',
  templateUrl: './subscription.component.html',
  styleUrls: ['./subscription.component.scss']
})
export class SubscriptionComponent implements OnInit {

  constructor(private router: Router,) { }

  getSubsData: String;
  ngOnInit(): void {
    this.getSubsData = localStorage.getItem('subs_ends');
    // console.log(this.getSubsData)
    this.calculateDiff(this.getSubsData);
  }

  calculateDiff(dateSent){
    let currentDate = new Date();
    dateSent = new Date(dateSent);

    return Math.floor((Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()) - Date.UTC(dateSent.getFullYear(), dateSent.getMonth(), dateSent.getDate()) ) /(1000 * 60 * 60 * 24));
}
  
  addSubs(value, data?) {
    localStorage.setItem("supportAction", value);
    localStorage.setItem("supportToEdit", JSON.stringify(data));
    this.router.navigate(['admin/inaipi/dashboard/support']);
  }

   // navigate to support page
  support(){
    this.router.navigate(['/admin/inaipi/dashboard/support']);
  }
}
