import { Component, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../../../auth/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { OrganizationIdSharingService } from '../../../../service/data.service';
import * as _ from 'underscore';
import { Country } from '../../../../models/country.model';
import { Subscription } from 'rxjs';
declare let $: any;

@Component({
  selector: 'app-manage-provider',
  templateUrl: './manage-provider.component.html',
  styleUrls: ['./manage-provider.component.scss']
})
export class ManageProviderComponent implements OnInit, OnDestroy {
  sharingSubscription: Subscription;
  counrtySubscription: Subscription;
  addProviderSubscription: Subscription;
  editProviderSubscription: Subscription;
  providerForm: FormGroup;
  orgId: string;
  permissions: any = [];
  countryList: Country[];
  providerAction: any;
  providerToEdit: any;

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
    this.providerAction = localStorage.getItem("providerAction");
    if (this.providerAction == 'edit') {
      this.providerToEdit = JSON.parse(localStorage.getItem("userToEdit"));
    }
  }

  ngOnDestroy():void {
    this.sharingSubscription.unsubscribe();
    this.counrtySubscription?.unsubscribe();
    this.addProviderSubscription?.unsubscribe();
    this.editProviderSubscription?.unsubscribe();
  }

  formInit(organization: string) {
    this.providerForm = this.fb.group({
      organization: [organization],
      name: ['', Validators.required],
      street: ['', Validators.required],
      city: ['',Validators.required],
      stateOrPOBox: ['', Validators.required],
      country: ['', Validators.required],
      bldgBlock: [''],
      description: [''],
    });
  }

  setFormValues() {
    if (this.providerAction == 'edit') {
      this.providerToEdit = JSON.parse(localStorage.getItem("providerToEdit"));
      this.providerForm.patchValue({
        name: this.providerToEdit['name'],
        street: this.providerToEdit['street'],
        city: this.providerToEdit['city'],
        stateOrPOBox: this.providerToEdit['stateOrPOBox'],
        country: this.providerToEdit['country']['_id'],
        bldgBlock: this.providerToEdit['bldgBlock'],
        description: this.providerToEdit['description'],
        organization: this.providerToEdit['organization']['_id']
      });
    }
  }

  getLists(){
    this.counrtySubscription = this.authService.getCountries().subscribe( res => {
      if (res['success']) {
      this.countryList = res['data'];
      } else {
        this.toastr.error(res['message'], 'Error!')
      }
      }, () => {
      this.toastr.error('Something went wrong', 'Error!')
    });
  }

  createUpdateProvider(formValue) {
    formValue['organization'] = this.orgId;

    if (this.providerAction == 'add') {
      this.addProviderSubscription = this.authService.addProvider(formValue).subscribe(res => {
        this.clearProviderForm();
        if (res['success']) {
          this.toastr.success(res['message'], 'Success!');
        } else {
          this.toastr.error(res['message'], 'Error!')
        }
      }, () => {
        this.clearProviderForm();
        this.toastr.error('Something went wrong', 'Error!')
      });
    } else {
      this.editProviderSubscription = this.authService.editProvider(formValue, this.providerToEdit['_id']).subscribe(res => {
        this.clearProviderForm();
        if (res['success']) {
          this.toastr.success(res['message'], 'Success!');
        } else {
          this.toastr.error(res['message'], 'Error!')
        }
      }, () => {
        this.clearProviderForm();
        this.toastr.error('Something went wrong', 'Error!')
      });
    }
  }

  clearProviderForm() {
    this.providerForm.reset();
    this.formInit(this.orgId);
    this.router.navigate(['admin/inaipi/setup']);
  }

}
