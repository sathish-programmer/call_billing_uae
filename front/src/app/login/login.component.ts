import { data } from 'jquery';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../auth/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  email: [''];
  password: [''];

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ngOnInit(): void {}

  signIn() {
    const user = { email: this.email, password: this.password };
    if (user.email && user.password) {
      this.authService.login(user).subscribe(
        (res) => {
          console.log(res);
          if (res['success'] && res['data']['loginType'] == 'normal') {
            console.log('cond 1');
            localStorage.setItem('token', res['data']['token']);
            localStorage.setItem(
              'organization',
              res['data']['organization']['_id']
            );
            localStorage.setItem('firstName', res['data']['firstName']);
            localStorage.setItem('lastName', res['data']['lastName']);
            localStorage.setItem('email', res['data']['email']);
            localStorage.setItem('isSU', res['data']['isSU']);
            localStorage.setItem(
              'pendingAmount',
              res['data']['availableAmount']
            );
            this.fetchRoles();
          } else if (res['success'] && res['data']['loginType'] == 'fromWeb') {
            this.http
              .post('http://10.13.224.3/api/cdrLoginStatus', user)
              .subscribe((result) => {
                console.log(result);
                if (result['success'] && result['allowLogin']) {
                  localStorage.setItem('subs_ends', result['message']);
                  localStorage.setItem('token', res['data']['token']);
                  localStorage.setItem(
                    'organization',
                    res['data']['organization']['_id']
                  );
                  localStorage.setItem('firstName', res['data']['firstName']);
                  localStorage.setItem('lastName', res['data']['lastName']);
                  localStorage.setItem('email', res['data']['email']);
                  localStorage.setItem('isSU', res['data']['isSU']);
                  localStorage.setItem(
                    'pendingAmount',
                    res['data']['availableAmount']
                  );
                  this.fetchRoles();
                } else {
                  this.toastr.error('Error, Subscription ended', 'Error!');
                }
              });
          } else {
            this.toastr.error(res['message'], 'Error!');
          }
        },
        () => {
          this.toastr.error('Something went Wrong', 'Error!');
        }
      );
    }
  }

  fetchRoles() {
    this.authService.getRoles().subscribe(
      (res) => {
        // console.log(res)
        if (res['success']) {
          localStorage.setItem(
            'permissions',
            JSON.stringify(res['data']['list'])
          );
          this.toastr.success('Logged in successfully.', 'Success!');
          this.router.navigate(['/admin']);
        } else {
          this.toastr.error(res['message'], 'Error!');
        }
      },
      () => {
        this.toastr.error('Something went Wrong', 'Error!');
      }
    );
  }
}
