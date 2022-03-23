import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({providedIn: 'root'})

export class LoginGuard implements CanActivate {
  constructor (private authService:AuthService, private router:Router){

  }

  canActivate() {
    if(this.authService.loggedIn()) {
      this.router.navigate(['/admin']);
      return false
    } else {
      return true;
    }
  }
}
