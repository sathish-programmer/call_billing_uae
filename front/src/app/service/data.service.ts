import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Organization } from '../models/organization.model';

@Injectable({
  providedIn: 'root'
})
export class OrganizationIdSharingService {

  private orgId = new Subject<string>();
  currentOrgId = this.orgId.asObservable();

  private orgList = new Subject<boolean>();
  currentOrgList = this.orgList.asObservable();

  changeOrgList(org) {
    this.orgList.next(org)
  }

  changeOrgId(id: string) {
    this.orgId.next(id)
  }
}