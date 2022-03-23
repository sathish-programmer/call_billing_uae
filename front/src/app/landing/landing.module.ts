import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LandingRoutingModule } from './landing-routing.module';
import { LandingComponent } from './landing.component';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OrgDropDownComponent } from '../shared/org-drop-down/org-drop-down.component';
import {SearchPipe}  from "../shared/filter.pipe";

@NgModule({
  declarations: [LandingComponent, NavbarComponent, OrgDropDownComponent, SearchPipe],
  imports: [
    CommonModule,
    LandingRoutingModule,
    ReactiveFormsModule,
    FormsModule
  ]
})
export class LandingModule { }
