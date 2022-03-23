import { Component, OnInit } from '@angular/core';
import { OrganizationIdSharingService } from '../service/data.service';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
  providers: [OrganizationIdSharingService]
})

export class LandingComponent implements OnInit {
  constructor(private orgIdSharingService: OrganizationIdSharingService) { }
  copyRightYear: number = new Date().getFullYear();
  ngOnInit(): void {
  }

  saveOrgId(orgId: string): void {
    this.orgIdSharingService.changeOrgId(orgId);
  }
}
