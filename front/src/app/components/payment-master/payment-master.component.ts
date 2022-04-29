import { unsupported } from '@angular/compiler/src/render3/view/util';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/auth/auth.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { PackageMaster } from '../../models/package.model';
import { Subscription } from 'rxjs';
declare let $: any;
@Component({
  selector: 'app-payment-master',
  templateUrl: './payment-master.component.html',
  styleUrls: ['./payment-master.component.scss'],
})
export class PaymentMasterComponent implements OnInit {
  paymentMasterForm: FormGroup;
  packPaginator = { limit: 10, skip: 1, total: 0 };
  packId: String;
  packListSubscription: Subscription;
  addPackSubscription;
  pacakgeDepartmentSubscription: Subscription;
  packgList: PackageMaster[];
  packageName: any;
  currencySymbol: any;
  editPacktSubscription: Subscription;
  currencyListSubscription: Subscription;
  currencyList: [] = [];
  constructor(
    private authService: AuthService,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.formInit();
    this.getPackList(1);
  }

  ngOnDestroy(): void {
    this.packListSubscription.unsubscribe();
    this.pacakgeDepartmentSubscription?.unsubscribe();
    this.editPacktSubscription?.unsubscribe();
    this.addPackSubscription?.unsubscribe;
  }

  formInit() {
    this.paymentMasterForm = this.fb.group({
      packageVal: ['', Validators.required],
      currency: ['', Validators.required],
    });
  }

  clearPacktForm() {
    $('#editPackModal').modal('hide');
    $('#addPackModal').modal('hide');
    this.paymentMasterForm.reset();
  }
  getPackList(skip) {
    this.currencyListSubscription = this.authService
      .getCurrencyList(skip)
      .subscribe(
        (res) => {
          if (res['success']) {
            this.currencyList = res['data'];
          } else {
            this.toastr.error(res['message'], 'Error!');
          }
        },
        () => {
          this.toastr.error('Something went wrong', 'Error!');
        }
      );

    // this.paymentMasterForm.patchValue({ organization: this.orgId });
    this.packPaginator.skip = skip;
    let dataToSend = {
      skip: this.packPaginator.skip,
      limit: this.packPaginator.limit,
    };
    this.packListSubscription = this.authService.getPackageList().subscribe(
      (res) => {
        if (res['success']) {
          console.log('this is package list', res['data']);
          this.packgList = res['data'];
          this.packPaginator.total = res['data'].length;
        } else {
          this.toastr.error(res['message'], 'Error!');
        }
      },
      () => {
        this.toastr.error('Something went wrong', 'Error!');
      }
    );
  }

  openMasterPopUp() {
    this.paymentMasterForm.patchValue({ packageVal: '' });
    $('#addPackModal').modal('show');
  }

  delete(packData: PackageMaster) {
    console.log('pack data', packData);
    if (packData) {
      this.packId = packData['_id'];
      this.packageName = packData['packageAmount'];
      $('#deleteModal').modal('show');
    }
  }

  deletePackage() {
    this.pacakgeDepartmentSubscription = this.authService
      .deletePackage(this.packId)
      .subscribe(
        (res) => {
          if (res['success']) {
            this.toastr.success('Package Deleted', 'Success!');
            $('#deleteModal').modal('hide');
            this.getPackList(this.packPaginator.skip);
          } else {
            this.toastr.error(res['message'], 'Error!');
          }
        },
        () => {
          this.toastr.error('Something went wrong', 'Error!');
        }
      );
  }

  editPack(packData: PackageMaster) {
    this.paymentMasterForm.reset();
    if (packData) {
      this.packId = packData['_id'];
      this.packageName = packData['packageAmount'];
      this.currencySymbol = packData['currencySymbol'];
      this.paymentMasterForm.patchValue({
        packageVal: packData['packageAmount'],
        currency: packData['currencySymbol'],
      });
      $('#editPackModal').modal('show');
    }
  }

  updatePack(formValue) {
    formValue['id'] = this.packId;
    console.log(formValue);
    this.editPacktSubscription = this.authService
      .updatePackage(formValue)
      .subscribe(
        (res) => {
          if (res['success']) {
            this.toastr.success('Package Updated', 'Success!');
            this.clearPacktForm();
            this.getPackList(this.packPaginator.skip);
          } else {
            this.clearPacktForm();
            this.toastr.error(res['message'], 'Error!');
          }
        },
        () => {
          this.clearPacktForm();
          this.toastr.error('Something went wrong', 'Error!');
        }
      );
  }

  addPackageMaster(formValue) {
    console.log(formValue);
    // return;
    this.addPackSubscription = this.authService.addPackage(formValue).subscribe(
      (res) => {
        if (res['success']) {
          this.toastr.success(res['message'], 'Success!');
          this.clearPacktForm();
          this.getPackList(1);
        } else {
          this.clearPacktForm();
          this.toastr.error(res['message'], 'Error!');
        }
      },
      () => {
        this.clearPacktForm();
        this.toastr.error('Something went wrong', 'Error!');
      }
    );
  }
}
