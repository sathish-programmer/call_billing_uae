import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { PRODUCT_ROUTES } from './menu.routes';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { ToastrService } from 'ngx-toastr';
import { User } from '../../models/user.model';

import * as feather from 'feather-icons';

declare var $: any;

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss', '../scss/common.scss'],
})
export class NavbarComponent implements OnInit, OnDestroy {
  @Output() sendOrgIdToParent = new EventEmitter<string>();
  menuItems: any;
  orgList: any;
  userInfo: User;
  getSubsData: String;

  constructor(
    private router: Router,
    private authService: AuthService,
    private toastrService: ToastrService
  ) {}

  ngOnInit() {
    this.getAllPaymentDetails();
    this.getRoleList();

    this.userInfo = {
      firstName: localStorage.getItem('firstName'),
      lastName: localStorage.getItem('lastName'),
      email: localStorage.getItem('email'),
      pendingAmount: localStorage.getItem('pendingAmount'),
      paymentGoingToExpire: localStorage.getItem('paymentGoingToExpire'),
      userRole: localStorage.getItem('userRole'),
      currencySymbol: localStorage.getItem('currencySymbol'),
    };

    this.getSubsData = localStorage.getItem('subs_ends');
  }

  ngAfterViewInit() {
    feather.replace();
  }

  ngOnDestroy() {}

  getAllPaymentDetails() {
    let email = localStorage.getItem('email');
    const user = { email: email };
    if (user.email) {
      this.authService.getPaymentDetails(user).subscribe((res) => {
        if (res['success']) {
          localStorage.setItem(
            'paymentGoingToExpire',
            res['data']['paymentGoingToExpire']
          );
          localStorage.setItem('pendingAmount', res['data']['availableAmount']);
        }
      });
    }
  }

  getRoleList() {
    this.authService.getRoles().subscribe((res) => {
      if (res['success']) {
        let userRole = localStorage.getItem('userRole');
        // add manange payment role for admin
        if (localStorage.getItem('email') == 'admin@inaipi.com') {
          res['data']['list'].push('canManagePayment');
        } else {
          res['data']['list'].push('canManagePaymentAmount');
        }
        res['data']['list'].push(userRole);
        this.menuItems = PRODUCT_ROUTES.paths(res['data']['list']);
        localStorage.setItem(
          'permissions',
          JSON.stringify(res['data']['list'])
        );
      } else {
        this.toastrService.error(res['message'], 'Error!');
      }
    });
  }

  sendOrgIdToParentComponent(orgId: string): void {
    this.sendOrgIdToParent.emit(orgId);
  }

  logout() {
    this.authService.logout().subscribe((res) => {
      if (res['success']) {
        localStorage.clear();
        this.router.navigate(['/login']);
      } else {
        this.toastrService.error(res['message'], 'Error!');
      }
    });
  }

  // navigate to support page
  support() {
    this.router.navigate(['/admin/inaipi/dashboard/support']);
  }
}
