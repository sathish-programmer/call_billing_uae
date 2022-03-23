import { AfterViewInit, Component, NgZone, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { data } from 'jquery';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { OrganizationIdSharingService } from 'src/app/service/data.service';
declare let $: any;
import * as _ from 'underscore';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit {
  sharingSubscription: Subscription;
  orgId: string;
  control: FormControl;
  permissions: any = [];

  validationMaxDate = moment();
  config = {
    max: this.validationMaxDate
  }

  tabValueChartTop = 1;
  tabValue = 1;
  tabValueChartBtm = 1;
  callSummaryJson = {
    totalCalls: 0, incomingCalls: 0, incomingCallsDuration: 0,
    outgoingCalls: 0, outgoingCallsDuration: 0, missedCalls: 0,
    internationalOutgoingCalls: 0, averageTalkTime: 0,
    totalChargableCalls: 0, totalChargableCallsCost: 0,
    lastCallTime: ''
  };

  todayJson = JSON.parse(JSON.stringify(this.callSummaryJson));
  previousJson = JSON.parse(JSON.stringify(this.callSummaryJson));

  durationLimit = 7;
  durationSkipPage = 1;
  durationTotal = 0;

  costLimit = 7;
  costSkipPage = 1;
  costTotal = 0;

  recentLimit = 7;
  recentSkipPage = 1;
  recentTotal = 0;

  missedLimit = 7;
  missedSkipPage = 1;
  missedTotal = 0;

  trunkLimit = 7;
  trunkSkipPage = 1;
  trunkTotal = 0;

  durationList = [];
  costList = [];
  recentList = [];
  missedList = [];
  trunkList = [];

  todayDateToShow = moment().format('MMM D, YYYY');
  previousDateToShow = moment().subtract(1, 'days').format('MMM D, YYYY');
  todayDateToUse = moment().endOf('day');
  previousDateToUse = moment().subtract(1, 'days').startOf('day');
  savedDateChangeEvent;

  // CHART 1
  public barChartOptions: any = { scaleShowVerticalLines: false, responsive: true };
  // public barChartLabels: string[] = ['Local', 'Mobile', 'National', 'International', 'Internal', 'Service'];
  public barChartLabels: string[] = ['Local', 'Mobile', 'International', 'Internal', 'Service'];
  public barChartType: string = 'bar';
  public chartLegend: boolean = true;
  public barChartData: any[] = [{ data: [0, 0, 0, 0, 0, 0, 0], label: 'Outgoing Call Summary' }];

  // CHART 2
  public lineChartData: Array<any> = [{ data: [0, 0, 0, 0, 0, 0, 0, 0], label: 'Outgoing Call Usage (X-Time, Y-Sec)' }];
  public lineChartLabels: Array<any> = ['', '10', '11', '12', '13', '14', '15', '16'];
  public lineChartOptions: any = { responsive: true };
  public lineChartType: string = 'line';

  //CHART 3
  public lineChartDataIncoming: Array<any> = [{ data: [0, 0, 0, 0, 0, 0, 0, 0], label: 'Incoming Call Usage (X-Time, Y-Sec)' }];
  public lineChartLabelsIncoming: Array<any> = ['', '10', '11', '12', '13', '14', '15', '16'];

  constructor(
    private _zone: NgZone,
    private sharingService: OrganizationIdSharingService,
    private authService: AuthService
  ) {
    $("#org-dropdown-navbar").prop("disabled", false);
    this.sharingSubscription = this.sharingService.currentOrgId.subscribe(orgId => {
      this.orgId = orgId;
      this.getAllList();

      // this.formInit(orgId);
      // this.getLists(orgId);
    });
  }

  ngAfterViewInit(): void {
    let that = this;

    setTimeout(function () {
      that.orgId = $("#org-dropdown-navbar").attr('value');

      if (that.orgId) {
        that.getAllList();
      }
    }, 300);
  }

  ngOnInit(): void {
    this.permissions = JSON.parse(localStorage.getItem("permissions"));
  }

  getAllList() {
    this.getCallListDurationWise(this.orgId, 1);
    this.getCallListCostWise(this.orgId, 1);
    this.getCallListRecentWise(this.orgId, 1);
    this.getCallListMissedWise(this.orgId, 1);
    this.getCallListTrunkWise(this.orgId, 1);
    this.getCallSummary(this.orgId)
  }

  dateChange(event) {
    this.savedDateChangeEvent = event.date._d;
  }

  getCallSummary(orgId) {
    this.todayCallSummary(orgId);
    this.previousCallSummary(orgId);
  }

  callDateChangeEvent() {
    this._zone.run(() => {
      this.todayDateToShow = moment(this.savedDateChangeEvent).format('MMM D, YYYY');
      this.previousDateToShow = moment(this.savedDateChangeEvent).subtract(1, 'days').format('MMM D, YYYY');
      this.todayDateToUse = moment(this.savedDateChangeEvent).endOf('day');
      this.previousDateToUse = moment(this.savedDateChangeEvent).subtract(1, 'days').startOf('day');
    });
    this.getAllList();
  }

  todayCallSummary(orgId) {
    var startDate = moment(this.todayDateToShow).startOf('day').utc(true);
    var endDate = moment(this.todayDateToShow).endOf('day').utc(true);
    var dataToSend = {
      startDate: startDate['_d'],
      endDate: endDate['_d']
    };

    this.authService.getCallSummary(orgId, dataToSend).subscribe(res => {
      this.todayJson = this.bifurcateCallSummaryRelatedData(res['data'], true);
    })
  }

  previousCallSummary(orgId) {
    var startDate = moment(this.previousDateToUse).startOf('day').utc(true);
    var endDate = moment(this.previousDateToUse).endOf('day').utc(true);
    var dataToSend = {
      orgId: orgId,
      startDate: startDate['_d'],
      endDate: endDate['_d']
    };

    this.authService.getCallSummary(orgId, dataToSend).subscribe(res => {
      this.previousJson = this.bifurcateCallSummaryRelatedData(res['data'], false);
    });
  }

  bifurcateCallSummaryRelatedData(data, callChartFunction) {
    var logFileData = data;
    var resultJSON = JSON.parse(JSON.stringify(this.callSummaryJson));

    resultJSON['missedCalls'] = (_.where(logFileData, { "CallDuration": 0 })).length;
    resultJSON['totalCalls'] = logFileData.length;

    if (logFileData && logFileData.length) {
      resultJSON['lastCallTime'] = moment(logFileData[0]['CallTime']).utc(false).format('LT');
    }

    var allIncomingCalls = _.where(logFileData, { 'Direction': "I" });
    if (allIncomingCalls && allIncomingCalls.length) {
      resultJSON['incomingCalls'] = allIncomingCalls.length;
      var incomingCallsDurationArray = _.difference(_.pluck(allIncomingCalls, "CallDuration"), [NaN]);
      resultJSON['incomingCallsDuration'] = _.reduce(incomingCallsDurationArray, function (memo, num) {
        return memo + num;
      }, 0);

    }

    if (callChartFunction) {
      this.makeCallChartUsage(allIncomingCalls, 'incoming');
    }

    var allOutgoingCalls = _.where(logFileData, { 'Direction': "O" });
    if (allOutgoingCalls && allOutgoingCalls.length) {
      resultJSON['outgoingCalls'] = allOutgoingCalls.length;
      var outgoingCallsDurationArray = _.difference(_.pluck(allOutgoingCalls, "CallDuration"), [NaN]);
      resultJSON['outgoingCallsDuration'] = _.reduce(outgoingCallsDurationArray, function (memo, num) {
        return memo + num;
      }, 0);

      resultJSON['internationalOutgoingCalls'] = this.filterTypeFromOutGoingData(allOutgoingCalls, 'international');

    }

    if (callChartFunction) {
      this.makeOutgoingCallChartSummary(allOutgoingCalls);
      this.makeCallChartUsage(allOutgoingCalls, 'outgoing');
    }

    if ((resultJSON['incomingCallsDuration'] || resultJSON['outgoingCallsDuration']) && resultJSON['totalCalls']) {
      resultJSON['averageTalkTime'] = ((resultJSON['incomingCallsDuration'] + resultJSON['outgoingCallsDuration']) / resultJSON['totalCalls']).toFixed(2);
    }

    resultJSON['totalChargableCalls'] = resultJSON['totalCalls'];
    var allCalculatedCostArray = _.difference(_.pluck(logFileData, "CalculatedCost"), [NaN, undefined]);
    resultJSON['totalChargableCallsCost'] = (_.reduce(allCalculatedCostArray, function (memo, num) {
      return memo + num;
    }, 0)).toFixed(2);

    return resultJSON;
  }

  filterTypeFromOutGoingData(calls, type) {
    var returnCallsArray = _.filter(calls, function (singleJson) {
      if (singleJson['CallType'] && singleJson['CallType'].length) {
        return (singleJson['CallType'].indexOf(type) >= 0);
      }
    });

    return (returnCallsArray && returnCallsArray.length ? returnCallsArray.length : 0);
  }

  makeOutgoingCallChartSummary(outgoingCalls) {
    this._zone.run(() => {
      var data = [this.filterTypeFromOutGoingData(outgoingCalls, 'local'),
      this.filterTypeFromOutGoingData(outgoingCalls, 'mobile'),
      this.filterTypeFromOutGoingData(outgoingCalls, 'national'),
      this.filterTypeFromOutGoingData(outgoingCalls, 'international'),
      this.filterTypeFromOutGoingData(outgoingCalls, 'internal'),
      this.filterTypeFromOutGoingData(outgoingCalls, 'service')];

      this.barChartData[0]['data'] = data;
    });
  }

  makeCallChartUsage(allCalls, callType) {
    this._zone.run(() => {
      allCalls.reverse();
      var chartData, chartLabel;

      if (allCalls && allCalls.length) {
        var allTime = _.difference(_.pluck(allCalls, "CallTime"), [undefined]);
        allTime = _.uniq(allTime);

        // var firstTime = moment(allTime[0]).subtract(1, 'hours').seconds(0).minutes(0).milliseconds(0);
        // allTime.unshift(firstTime._d);
        var lastTime = moment(allTime[allTime.length - 1]).utc(false).add(1, 'hours').seconds(0).minutes(0).milliseconds(0);
        allTime.push(lastTime['_d']);

        var allTime: any[] = _.map(allTime, function (singleTime) {
          var formatedData = moment(singleTime).utc(false).seconds(0).minutes(0).milliseconds(0);
          var timeFromData = moment(formatedData).utc(false).format().split('T');
          var splitedData = parseInt(timeFromData[1].split(":")[0]);
          
          return { actualData: singleTime, formatData: formatedData['_d'], splitData: splitedData};
        });

        var splitData = _.union(_.pluck(allTime, "splitData"));
        var formatData = _.uniq(_.pluck(allTime, "formatData"));

        var chartDataArray = [0];
        for (var index in formatData) {
          if (parseInt(index) < formatData.length) {
            if (String(formatData[index]) != String(formatData[parseInt(index) + 1])) {
              chartDataArray.push(this.filterDurationAsPerDateFromData(allCalls,
                formatData[index],
                formatData[parseInt(index) + 1]));
            }
          }
        }

        // splitData.pop();
        chartLabel = _.union(splitData);
        chartData = chartDataArray;
      } else {
        chartLabel = ['8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19'];
        chartData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      }


      this._zone.run(() => {
        if (callType == 'outgoing') {
          // let clone = JSON.parse(JSON.stringify(this.lineChartLabels));
          let clone = JSON.parse(JSON.stringify(chartLabel));
          this.lineChartLabels = clone;
          this.lineChartLabels = clone;

          this.lineChartData[0]['data'] = chartData;
        } else if (callType == 'incoming') {
          let clone = JSON.parse(JSON.stringify(this.lineChartLabelsIncoming));
          clone = JSON.parse(JSON.stringify(chartLabel));
          this.lineChartLabelsIncoming = clone;

          this.lineChartDataIncoming[0]['data'] = chartData;
        }
      });
    });
  }

  filterDurationAsPerDateFromData(calls, now, later) {
    var returnCallsArray = _.filter(calls, function (singleJson) {
      if ((moment(singleJson['CallTime']) >= now)
        && (moment(singleJson['CallTime']) <= later)) {
        return singleJson['CallDuration'];
      }
    });

    var duration = 0;

    for (var index in returnCallsArray) {
      duration += returnCallsArray[index]['CallDuration'];
    }

    return duration;
  }

  getCallListDurationWise(orgId, skipPage) {
    var startDate = moment(this.todayDateToShow).startOf('day').utc(true);
    var endDate = moment(this.todayDateToShow).endOf('day').utc(true);
    // this.searchData = this.searchData.trim();
    this.orgId = orgId;
    this.durationList = [];
    this.durationSkipPage = skipPage;

    var dataToSend = {
      skip: this.durationSkipPage,
      limit: this.durationLimit,
      type: 'duration',
      startDate: startDate['_d'],
      endDate: endDate['_d']
    };

    this.authService.getCallList(this.orgId, dataToSend).subscribe(res => {
      this.durationList = this.changeDateFormatForList(res['data']);
      this.durationTotal = res['total'];
    });
  }

  getCallListCostWise(orgId, skipPage) {
    var startDate = moment(this.todayDateToShow).startOf('day').utc(true);
    var endDate = moment(this.todayDateToShow).endOf('day').utc(true);
    // this.searchData = this.searchData.trim();
    this.orgId = orgId;
    this.costList = [];
    this.costSkipPage = skipPage;

    var dataToSend = {
      skip: this.costSkipPage,
      limit: this.costLimit,
      type: 'cost',
      startDate: startDate['_d'],
      endDate: endDate['_d']
    };

    this.authService.getCallList(this.orgId, dataToSend).subscribe(res => {
      this.costList = this.changeDateFormatForList(res['data']);
      this.costTotal = res['total'];
    });

  }

  getCallListRecentWise(orgId, skipPage) {
    var startDate = moment(this.todayDateToShow).startOf('day').utc(true);
    var endDate = moment(this.todayDateToShow).endOf('day').utc(true);
    // this.searchData = this.searchData.trim();
    this.orgId = orgId;
    this.recentList = [];
    this.recentSkipPage = skipPage;

    var dataToSend = {
      skip: this.recentSkipPage,
      limit: this.recentLimit,
      type: 'recent',
      startDate: startDate['_d'],
      endDate: endDate['_d']
    };

    this.authService.getCallList(this.orgId, dataToSend).subscribe(res => {
      this.recentList = this.changeDateFormatForList(res['data']);
      this.recentTotal = res['total'];
    });

  }

  getCallListMissedWise(orgId, skipPage) {
    var startDate = moment(this.todayDateToShow).startOf('day').utc(true);
    var endDate = moment(this.todayDateToShow).endOf('day').utc(true);
    // this.searchData = this.searchData.trim();
    this.orgId = orgId;
    this.missedList = [];
    this.missedSkipPage = skipPage;

    var dataToSend = {
      skip: this.missedSkipPage,
      limit: this.missedLimit,
      type: 'missed',
      startDate: startDate['_d'],
      endDate: endDate['_d']
    };

    this.authService.getCallList(this.orgId, dataToSend).subscribe(res => {
      for (let index in res['data']) {
        // console.log(res['data'][index]['CallTime'] + ' sasa')
        res['data'][index]['CallTime'] = moment(res['data'][index]['CallTime']).utc(false).format('l LT');
      }
      this.missedList = this.changeDateFormatForListMissed(res['data']);
      this.missedTotal = res['total'];
    });
  }

  getCallListTrunkWise(orgId, skipPage) {
    var startDate = moment(this.todayDateToShow).startOf('day').utc(true);
    var endDate = moment(this.todayDateToShow).endOf('day').utc(true);
    // this.searchData = this.searchData.trim();
    this.orgId = orgId;
    this.trunkList = [];
    this.trunkSkipPage = skipPage;

    var dataToSend = {
      skip: this.trunkSkipPage,
      limit: this.trunkLimit,
      type: 'trunk',
      startDate: startDate['_d'],
      endDate: endDate['_d']
    };

    this.authService.getCallList(this.orgId, dataToSend).subscribe(res => {
      this.trunkList = this.changeDateFormatForList(res['data']);
      this.trunkTotal = res['total'];
    });
  }

  changeDateFormatForList(resData) {
    for (let index in resData) {
      resData[index]['CallTime'] = moment(resData[index]['CallTime']).utc(false).format('l LT');
    }

    return resData;
  }

  changeDateFormatForListMissed(resData) {
    for (let index in resData) {
      resData[index]['CallTime'] = moment(resData[index]['CallTime']).utc(true).format('l LT');
    }
    return resData;
  }
}
