import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from './../../environments/environment';
import { Observable } from 'rxjs';
import { Roles } from '../models/role.model';
import { User } from '../models/login.model';
import { Organization } from '../models/organization.model';
import { Department } from '../models/department.model';
import { Branch } from '../models/branch.model';
import { Timezone } from '../models/timezone.model';
import { Country } from '../models/country.model';
import { MasterRoles } from '../models/role-list.model';
import { Provider } from '../models/provider.model';
import { AssignedTariff } from '../models/assigned-tariff.model';
import { Tariff } from '../models/tariff.model';
import { TariffFile } from '../models/tariff-file.model';
import { SubDepartment } from '../models/sub-department.model';
import { CallLogs } from '../models/callLogs.model';

@Injectable()
export class AuthService {
  baseUrl = environment.baseUrl;
  constructor(private http: HttpClient) {}

  login(data): Observable<User> {
    return this.http
      .post<User>(this.baseUrl + 'auth/login', data)
      .pipe((res) => res);
  }

  logout(): Observable<any> {
    let headers = { headers: { token: localStorage.getItem('token') } };

    return this.http
      .post<any>(this.baseUrl + 'auth/logout', null, headers)
      .pipe((res) => res);
  }

  getRoles(): Observable<Roles[]> {
    let headers = { headers: { token: localStorage.getItem('token') } };

    return this.http
      .get<Roles[]>(this.baseUrl + 'role', headers)
      .pipe((res) => res);
    // catchError(this.handleError)
  }

  // get payment details
  getPaymentDetails(data) {
    let headers = { headers: { token: localStorage.getItem('token') } };
    return this.http
      .post<User>(this.baseUrl + 'payment/getFullPayDetails', data, headers)
      .pipe((res) => res);
  }
  // check user subscription
  // getSubscription(): Observable<Roles[]> {
  //   let headers = { headers: { token: localStorage.getItem("token") } };

  //   return this.http.get<Roles[]>(this.baseUrl + "role", headers)
  //     .pipe(res => res)
  //   // catchError(this.handleError)
  // }

  getOrganizationList(data?: any): Observable<Organization[]> {
    let headers = {
      params: data,
      headers: { token: localStorage.getItem('token') },
    };

    return this.http
      .get<Organization[]>(this.baseUrl + 'organization', headers)
      .pipe((res) => res);
  }

  getOrganizations(): Observable<Organization[]> {
    let headers = { headers: { token: localStorage.getItem('token') } };

    return this.http
      .get<Organization[]>(this.baseUrl + 'organization/list', headers)
      .pipe((res) => res);
  }

  sendOtpPayment(data) {
    let headers = { headers: { token: localStorage.getItem('token') } };
    return this.http
      .post(this.baseUrl + 'payment/sendotp', data, headers)
      .pipe((res) => res);
  }

  verifyOtpPayment(data) {
    let headers = { headers: { token: localStorage.getItem('token') } };
    return this.http
      .post(this.baseUrl + 'payment/verifyOtp', data, headers)
      .pipe((res) => res);
  }

  addPackageCredit(data) {
    let headers = { headers: { token: localStorage.getItem('token') } };
    return this.http
      .post(this.baseUrl + 'payment/addPackage', data, headers)
      .pipe((res) => res);
  }

  getPaymentOrgList(): Observable<Organization[]> {
    let headers = { headers: { token: localStorage.getItem('token') } };

    return this.http
      .get<Organization[]>(this.baseUrl + 'payment/getList', headers)
      .pipe((res) => res);
  }

  updatePayment(data, id) {
    let headers = { headers: { token: localStorage.getItem('token') } };

    return this.http
      .patch(this.baseUrl + 'payment/' + id, data, headers)
      .pipe((res) => res);
  }

  deletePayment(id) {
    let headers = { headers: { token: localStorage.getItem('token') } };
    return this.http
      .delete(this.baseUrl + 'payment/' + id, headers)
      .pipe((res) => res);
  }

  notifyPaymentAlertMail(id) {
    let headers = { headers: { token: localStorage.getItem('token') } };
    return this.http
      .get(this.baseUrl + 'payment/notifyPaymentExpire/' + id, headers)
      .pipe((res) => res);
  }

  getPaymentHistory(id) {
    let headers = { headers: { token: localStorage.getItem('token') } };
    return this.http
      .get(this.baseUrl + 'paymentHistory/list/' + id, headers)
      .pipe((res) => res);
  }

  getDataByDate(id) {
    let headers = { headers: { token: localStorage.getItem('token') } };
    return this.http
      .get(this.baseUrl + 'paymentHistory/lastMonthRecord/' + id, headers)
      .pipe((res) => res);
  }

  getFiveMonthData(id) {
    let headers = { headers: { token: localStorage.getItem('token') } };
    return this.http
      .get(this.baseUrl + 'paymentHistory/monthRecord/' + id, headers)
      .pipe((res) => res);
  }

  downloadCostReport(data) {
    let headers = { headers: { token: localStorage.getItem('token') } };
    return this.http
      .post(this.baseUrl + 'paymentHistory/download/getPdf', data, headers)
      .pipe((res) => res);
  }

  addOrganization(data) {
    let headers = { headers: { token: localStorage.getItem('token') } };

    return this.http
      .post(this.baseUrl + 'organization', data, headers)
      .pipe((res) => res);
  }

  updateOrganization(data, id) {
    let headers = { headers: { token: localStorage.getItem('token') } };

    return this.http
      .patch(this.baseUrl + 'organization/' + id, data, headers)
      .pipe((res) => res);
  }

  deleteOrganization(id) {
    let headers = { headers: { token: localStorage.getItem('token') } };
    return this.http
      .delete(this.baseUrl + 'organization/' + id, headers)
      .pipe((res) => res);
  }

  getDepartmentList(
    orgId?: any,
    data?: any,
    branchId?: any
  ): Observable<Department[]> {
    let headers = {
      params: data,
      headers: { token: localStorage.getItem('token') },
    };

    if (branchId) {
      headers['params'] = { branch: branchId };
    }

    return this.http
      .get<Department[]>(this.baseUrl + 'department/' + orgId, headers)
      .pipe((res) => res);
  }

  addDepartment(data) {
    let headers = { headers: { token: localStorage.getItem('token') } };

    return this.http
      .post(this.baseUrl + 'department', data, headers)
      .pipe((res) => res);
  }

  updateDepartment(data, id) {
    let headers = { headers: { token: localStorage.getItem('token') } };

    return this.http
      .patch(this.baseUrl + 'department/' + id, data, headers)
      .pipe((res) => res);
  }

  deleteDepartment(id) {
    let headers = { headers: { token: localStorage.getItem('token') } };
    return this.http
      .delete(this.baseUrl + 'department/' + id, headers)
      .pipe((res) => res);
  }

  addPackage(data) {
    let headers = { headers: { token: localStorage.getItem('token') } };

    return this.http
      .post(this.baseUrl + 'paymentMaster/add', data, headers)
      .pipe((res) => res);
  }

  updatePackage(data) {
    let headers = { headers: { token: localStorage.getItem('token') } };

    return this.http
      .patch(this.baseUrl + 'paymentMaster/update/', data, headers)
      .pipe((res) => res);
  }

  deletePackage(id) {
    let headers = { headers: { token: localStorage.getItem('token') } };
    return this.http
      .delete(this.baseUrl + 'paymentMaster/delete/' + id, headers)
      .pipe((res) => res);
  }

  getSubDeptList(orgId?: any, data?: any): Observable<SubDepartment[]> {
    let headers = {
      params: data,
      headers: { token: localStorage.getItem('token') },
    };
    return this.http
      .get<SubDepartment[]>(this.baseUrl + 'sub-department/' + orgId, headers)
      .pipe((res) => res);
  }

  addSubDepartment(data) {
    let headers = { headers: { token: localStorage.getItem('token') } };
    return this.http
      .post(this.baseUrl + 'sub-department', data, headers)
      .pipe((res) => res);
  }

  updateSubDepartment(data, id) {
    let headers = { headers: { token: localStorage.getItem('token') } };
    return this.http
      .patch(this.baseUrl + 'sub-department/' + id, data, headers)
      .pipe((res) => res);
  }

  deleteSubDepartment(id) {
    let headers = { headers: { token: localStorage.getItem('token') } };
    return this.http
      .delete(this.baseUrl + 'sub-department/' + id, headers)
      .pipe((res) => res);
  }

  getBranchList(orgId?: any, data?: any): Observable<Branch[]> {
    let headers = { headers: { token: localStorage.getItem('token') } };
    if (data) {
      headers['params'] = data;
    }
    return this.http
      .get<Branch[]>(this.baseUrl + 'branch/' + orgId, headers)
      .pipe((res) => res);
  }

  addBranch(data) {
    let headers = { headers: { token: localStorage.getItem('token') } };

    return this.http
      .post(this.baseUrl + 'branch', data, headers)
      .pipe((res) => res);
  }

  updateBranch(data, id) {
    let headers = { headers: { token: localStorage.getItem('token') } };

    return this.http
      .patch(this.baseUrl + 'branch/' + id, data, headers)
      .pipe((res) => res);
  }

  deleteBranch(id) {
    let headers = { headers: { token: localStorage.getItem('token') } };
    return this.http
      .delete(this.baseUrl + 'branch/' + id, headers)
      .pipe((res) => res);
  }

  getTimezones(): Observable<Timezone[]> {
    let headers = { headers: { token: localStorage.getItem('token') } };

    return this.http
      .get<Timezone[]>(this.baseUrl + 'timezone', headers)
      .pipe((res) => res);
  }

  getCountries(): Observable<Country[]> {
    let headers = { headers: { token: localStorage.getItem('token') } };

    return this.http
      .get<Country[]>(this.baseUrl + 'country', headers)
      .pipe((res) => res);
  }

  getMasterRoleList(): Observable<MasterRoles[]> {
    let headers = { headers: { token: localStorage.getItem('token') } };

    return this.http
      .get<MasterRoles[]>(this.baseUrl + 'role/fetch_master_role_list', headers)
      .pipe((res) => res);
  }

  getRolesList(orgId?: any, data?: any) {
    let headers = {
      params: data,
      headers: { token: localStorage.getItem('token') },
    };

    return this.http
      .get(this.baseUrl + 'role/' + orgId, headers)
      .pipe((res) => res);
  }

  addRole(data) {
    let headers = { headers: { token: localStorage.getItem('token') } };

    return this.http
      .post(this.baseUrl + 'role', data, headers)
      .pipe((res) => res);
  }

  editRole(data, id) {
    let headers = { headers: { token: localStorage.getItem('token') } };

    return this.http
      .patch(this.baseUrl + 'role/' + id, data, headers)
      .pipe((res) => res);
  }

  deleteRole(id) {
    let headers = { headers: { token: localStorage.getItem('token') } };
    return this.http
      .delete(this.baseUrl + 'role/' + id, headers)
      .pipe((res) => res);
  }

  getUserList(data?: any, orgId?: any) {
    let headers = {
      params: data,
      headers: { token: localStorage.getItem('token') },
    };
    return this.http
      .get(this.baseUrl + 'user/' + orgId, headers)
      .pipe((res) => res);
  }

  getPackageList() {
    let headers = {
      headers: { token: localStorage.getItem('token') },
    };
    return this.http
      .get(this.baseUrl + 'paymentMaster/', headers)
      .pipe((res) => res);
  }

  getDataProviderUserList(orgId?: any) {
    let headers = { headers: { token: localStorage.getItem('token') } };
    return this.http
      .get(this.baseUrl + 'user/dp_user/' + orgId, headers)
      .pipe((res) => res);
  }

  addUser(data) {
    let headers = { headers: { token: localStorage.getItem('token') } };
    return this.http
      .post(this.baseUrl + 'user', data, headers)
      .pipe((res) => res);
  }

  editUser(data, id) {
    let headers = { headers: { token: localStorage.getItem('token') } };
    return this.http
      .patch(this.baseUrl + 'user/' + id, data, headers)
      .pipe((res) => res);
  }

  deleteUser(id) {
    let headers = { headers: { token: localStorage.getItem('token') } };
    return this.http
      .delete(this.baseUrl + 'user/' + id, headers)
      .pipe((res) => res);
  }

  createTokenDPUser(id) {
    let headers = { headers: { token: localStorage.getItem('token') } };
    return this.http
      .get(this.baseUrl + 'user/create_token/' + id, headers)
      .pipe((res) => res);
  }

  getProviderList(
    orgId?: any,
    data?: any,
    branchId?: any
  ): Observable<Provider[]> {
    let headers = {
      params: data,
      headers: { token: localStorage.getItem('token') },
    };

    if (branchId) {
      headers['params'] = { branch: branchId };
    }

    return this.http
      .get<Provider[]>(this.baseUrl + 'provider/' + orgId, headers)
      .pipe((res) => res);
  }

  addProvider(data) {
    let headers = { headers: { token: localStorage.getItem('token') } };

    return this.http
      .post(this.baseUrl + 'provider', data, headers)
      .pipe((res) => res);
  }

  editProvider(data, id) {
    let headers = { headers: { token: localStorage.getItem('token') } };

    return this.http
      .patch(this.baseUrl + 'provider/' + id, data, headers)
      .pipe((res) => res);
  }

  deleteProvider(id) {
    let headers = { headers: { token: localStorage.getItem('token') } };
    return this.http
      .delete(this.baseUrl + 'provider/' + id, headers)
      .pipe((res) => res);
  }

  getAssignedTariffList(data?: any, orgId?: any): Observable<AssignedTariff[]> {
    let headers = {
      params: data,
      headers: { token: localStorage.getItem('token') },
    };
    return this.http
      .get<AssignedTariff[]>(this.baseUrl + 'assign-tariff/' + orgId, headers)
      .pipe((res) => res);
  }

  addAssignedTariff(data) {
    let headers = { headers: { token: localStorage.getItem('token') } };
    return this.http
      .post(this.baseUrl + 'assign-tariff', data, headers)
      .pipe((res) => res);
  }

  editAssignedTariff(data, id) {
    let headers = { headers: { token: localStorage.getItem('token') } };
    return this.http
      .patch(this.baseUrl + 'assign-tariff/' + id, data, headers)
      .pipe((res) => res);
  }

  addTariff(data) {
    let headers = { headers: { token: localStorage.getItem('token') } };
    return this.http
      .post(this.baseUrl + 'tariff', data, headers)
      .pipe((res) => res);
  }

  saveTariffFile(file) {
    let headers = { headers: { token: localStorage.getItem('token') } };
    return this.http
      .post(this.baseUrl + 'tariff/file', file, headers)
      .pipe((res) => res);
  }

  saveTariffFomFile(file) {
    let headers = { headers: { token: localStorage.getItem('token') } };

    return this.http
      .post(this.baseUrl + 'tariff/from/file', file, headers)
      .pipe((res) => res);
  }

  getTariffFile(data?: any, orgId?: any): Observable<TariffFile[]> {
    let headers = {
      params: data,
      headers: { token: localStorage.getItem('token') },
    };

    return this.http
      .get<TariffFile[]>(this.baseUrl + 'tariff/file/' + orgId, headers)
      .pipe((res) => res);
  }

  getTariffList(data?: any, orgId?: any): Observable<Tariff[]> {
    let headers = {
      params: data,
      headers: { token: localStorage.getItem('token') },
    };
    return this.http
      .get<Tariff[]>(this.baseUrl + 'tariff/' + orgId, headers)
      .pipe((res) => res);
  }

  getCurrencyList(orgId) {
    let headers = { headers: { token: localStorage.getItem('token') } };
    return this.http.get(this.baseUrl + 'currency', headers).pipe((res) => res);
  }

  addTariffRateAndTime(data) {
    let headers = { headers: { token: localStorage.getItem('token') } };
    return this.http
      .post(this.baseUrl + 'tariff/rate-and-time', data, headers)
      .pipe((res) => res);
  }

  getTariffRateTime(tariffId) {
    let headers = { headers: { token: localStorage.getItem('token') } };
    return this.http
      .get(this.baseUrl + 'tariff/rate-and-time/' + tariffId, headers)
      .pipe((res) => res);
  }

  deleteAssginTariff(id) {
    let headers = { headers: { token: localStorage.getItem('token') } };
    return this.http
      .delete(this.baseUrl + 'assign-tariff/' + id, headers)
      .pipe((res) => res);
  }

  deleteTariff(id) {
    let headers = { headers: { token: localStorage.getItem('token') } };
    return this.http
      .delete(this.baseUrl + 'tariff/' + id, headers)
      .pipe((res) => res);
  }

  deleteTariffFile(id) {
    let headers = { headers: { token: localStorage.getItem('token') } };
    return this.http
      .delete(this.baseUrl + 'tariff/file/' + id, headers)
      .pipe((res) => res);
  }

  getTariffDataToEdit(tariffId) {
    let headers = { headers: { token: localStorage.getItem('token') } };
    return this.http
      .get(this.baseUrl + 'tariff/' + tariffId + '/single', headers)
      .pipe((res) => res);
  }

  editTariff(data, id) {
    let headers = { headers: { token: localStorage.getItem('token') } };
    return this.http
      .patch(this.baseUrl + 'tariff/' + id, data, headers)
      .pipe((res) => res);
  }

  editTariffRateTime(data, id) {
    let headers = { headers: { token: localStorage.getItem('token') } };
    return this.http
      .patch(this.baseUrl + 'tariff/rate-and-time/' + id, data, headers)
      .pipe((res) => res);
  }

  getCallLogsBranchList(orgId): Observable<Branch[]> {
    let headers = { headers: { token: localStorage.getItem('token') } };
    if (localStorage.getItem('isSU') == 'true') {
      headers['params'] = { organization: orgId };
    }
    return this.http
      .get<Branch[]>(this.baseUrl + 'call-logs/branch/list', headers)
      .pipe((res) => res);
  }

  getCallLogsDeptList(branchId, orgId): Observable<Department[]> {
    let headers = { headers: { token: localStorage.getItem('token') } };
    if (branchId) {
      headers['params'] = { branch: branchId };
    }
    if (localStorage.getItem('isSU') == 'true') {
      headers['params'] = { organization: orgId };
    }
    return this.http
      .get<Department[]>(this.baseUrl + 'call-logs/department/list', headers)
      .pipe((res) => res);
  }

  getCallLogsExtensionList(branchId, departmentId, orgId) {
    let headers = { headers: { token: localStorage.getItem('token') } };
    if (branchId || departmentId) {
      headers['params'] = { branch: branchId, department: departmentId };
    }

    if (localStorage.getItem('isSU') == 'true') {
      headers['params'] = {
        organization: orgId,
        branch: branchId,
        department: departmentId,
      };
    }

    return this.http
      .get(this.baseUrl + 'call-logs/extension/list', headers)
      .pipe((res) => res);
  }

  getSavedListFilterList() {
    let headers = { headers: { token: localStorage.getItem('token') } };
    return this.http
      .get(this.baseUrl + 'call-report-template', headers)
      .pipe((res) => res);
  }

  saveCallReportFilter(data) {
    let headers = { headers: { token: localStorage.getItem('token') } };
    return this.http
      .post(this.baseUrl + 'call-report-template', data, headers)
      .pipe((res) => res);
  }

  deleteSavedFilter(id) {
    let headers = { headers: { token: localStorage.getItem('token') } };
    return this.http
      .delete(this.baseUrl + 'call-report-template/' + id, headers)
      .pipe((res) => res);
  }

  editCallReportFilter(data, id) {
    let headers = { headers: { token: localStorage.getItem('token') } };
    return this.http
      .patch(this.baseUrl + 'call-report-template/' + id, data, headers)
      .pipe((res) => res);
  }

  getCallLogs(orgId?: any, data?: any): Observable<CallLogs[]> {
    let headers = { headers: { token: localStorage.getItem('token') } };
    if (data) {
      headers['params'] = data;
    }
    return this.http
      .get<CallLogs[]>(this.baseUrl + 'call-logs/logs/all/' + orgId, headers)
      .pipe((res) => res);
  }

  getCallList(orgId, data) {
    let headers = { headers: { token: localStorage.getItem('token') } };
    return this.http
      .post(
        this.baseUrl + 'call-logs/list/' + orgId + '/type-wise',
        data,
        headers
      )
      .pipe((res) => res);
  }

  getCallSummary(orgId, data) {
    let headers = { headers: { token: localStorage.getItem('token') } };
    return this.http
      .post(
        this.baseUrl + 'call-logs/list/' + orgId + '/summary',
        data,
        headers
      )
      .pipe((res) => res);
  }

  getCallReportsList(orgId, data) {
    let headers = { headers: { token: localStorage.getItem('token') } };
    return this.http
      .post(this.baseUrl + 'call-report/' + orgId, data, headers)
      .pipe((res) => res);
  }

  downloadReportCSV(orgId, data) {
    let headers = { headers: { token: localStorage.getItem('token') } };
    return this.http
      .post(this.baseUrl + 'call-report/download/csv/' + orgId, data, headers)
      .pipe((res) => res);
  }

  downloadReportPDF(orgId, data) {
    let headers = { headers: { token: localStorage.getItem('token') } };
    return this.http
      .post(this.baseUrl + 'call-report/download/pdf/' + orgId, data, headers)
      .pipe((res) => res);
  }

  forgotPassword(data) {
    return this.http
      .post(this.baseUrl + 'user/forgot-password', data)
      .toPromise()
      .then((res) => res);
  }

  loadToken() {
    return localStorage.getItem('token');
  }

  loggedIn() {
    return this.loadToken() !== null;
  }
}
