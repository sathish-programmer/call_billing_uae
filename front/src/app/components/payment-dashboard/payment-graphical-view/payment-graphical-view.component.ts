import { HttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from './../../../auth/auth.service';
import { ChartsModule } from 'ng2-charts';
import { from } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { Chart } from 'chart.js';
import { CursorError } from '@angular/compiler/src/ml_parser/lexer';

@Component({
  selector: 'app-payment-graphical-view',
  templateUrl: './payment-graphical-view.component.html',
  styleUrls: ['./payment-graphical-view.component.scss'],
})
export class PaymentGraphicalViewComponent implements OnInit {
  currentDate: any;
  thisMonthStartDate: any;
  forecastTotal: any;
  forecastTotalForChart: any;
  getDataByDate: any;
  monthToDayData: number;
  calcBetweenDays: number;
  currentMonth: any;
  previousMonth: any;
  previousMonthCurrentDate: any;
  previousMonthFirstDate: any;
  lastFiveMonths = [];
  lastFiveMonthsData: any;
  availableAmount: any;
  lastPaidAmount: any;
  checkPayHistory: Boolean = false;
  lastPaidDate: any;

  getPaymentHistory: any;

  currentMonthCost: number;
  previousMonthCost: number;
  beforePreviousMonthCost: number;
  previousFourthMonthCost: number;
  previousFifthMonthCost: number;

  currentMnthCostInc: Boolean = false;
  currentMnthCostDec: Boolean = false;

  currentMnthForcastCostInc: Boolean = false;
  currentMnthForecastCostDec: Boolean = false;

  sumOfPrevCost: any;
  sumOfForecastCost: any;

  percenValForPrev: any;
  percenValForForcast: any;

  constructor(
    private authService: AuthService,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.getLastFiveMonths();
    this.getDatasByDate();
    this.getAllPayHistory();

    let currentDate = new Date();
    let firstDay = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );

    this.currentDate = currentDate;
    this.thisMonthStartDate = firstDay;
    var oneDay = 24 * 60 * 60 * 1000;
    var diffDays = Math.round(
      Math.abs((this.thisMonthStartDate - this.currentDate) / oneDay)
    );
    this.calcBetweenDays = diffDays;

    const dateStr = new Date().toDateString(); // 'Fri Apr 10 2020'
    const dateStrArr = dateStr.split(' '); // ['Fri', 'Apr', '10', '2020']
    this.currentMonth = dateStrArr[1] + ' ' + dateStrArr[3]; // 'Apr'

    let currentDate1 = new Date();
    currentDate1.setMonth(currentDate1.getMonth() - 1);
    const previousMonth = currentDate1.toLocaleString('default', {
      month: 'long',
    });

    this.previousMonth = previousMonth + ' ' + currentDate1.getFullYear();

    var todayDate = new Date().toISOString().slice(0, 10);
    var d = new Date(todayDate);
    d.setMonth(d.getMonth() - 1);

    this.previousMonthCurrentDate = d.toISOString().slice(0, 10);
    this.previousMonthFirstDate = d.setDate(1);
  }

  getLastFiveMonths() {
    var monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    var today = new Date();
    var year = today.getFullYear();
    var month = today.getMonth();
    var i = 0;

    do {
      if (month < 0) {
        month = 11;
        year--;
      }

      this.lastFiveMonths.push(monthNames[month]);
      // console.log(this.lastFiveMonths);
      month--;
      i++;
    } while (i < 5);
  }

  getDatasByDate() {
    let data = localStorage.getItem('organization');
    this.getDataByDate = this.authService.getDataByDate(data).subscribe(
      (res) => {
        let data = res['data'];
        this.lastFiveMonthsData = res['costForMonth'];
        // start chart
        let currentMonthCost =
          res['costForMonth']['currentMonthCost'].toFixed(2);
        let previousMonthCost = res['costForMonth']['lastMonthCost'].toFixed(2);
        let lastpreviousMonthCost =
          res['costForMonth']['lastPreviousMonthCost'].toFixed(2);
        let beforeLastPreviousMonthCost =
          res['costForMonth']['beforeLastPreviousMonthCost'].toFixed(2);
        let PreviousFifthMonthCost =
          res['costForMonth']['PreviousFifthMonthCost'].toFixed(2);
        var yValues = [
          currentMonthCost,
          previousMonthCost,
          lastpreviousMonthCost,
          beforeLastPreviousMonthCost,
          PreviousFifthMonthCost,
        ];

        console.log(yValues);

        let newXvalues = [];

        var xValues = this.lastFiveMonths;

        if (yValues[0] > 0) {
          newXvalues.push(xValues[0]);
        }
        if (yValues[1] > 0) {
          newXvalues.push(xValues[1]);
        }
        if (yValues[2] > 0) {
          newXvalues.push(xValues[2]);
        }
        if (yValues[3] > 0) {
          newXvalues.push(xValues[3]);
        }
        if (yValues[4] > 0) {
          newXvalues.push(xValues[4]);
        }

        console.log(newXvalues);
        // console.log('xvalues', yValues);
        var barColors = ['#b91d47', '#00aba9', '#2b5797', '#e8c3b9', '#1e7145'];
        let ctx = document.getElementById('myChart');
        let chart = new Chart('myChart', {
          type: 'doughnut',
          data: {
            labels: newXvalues,
            datasets: [
              {
                backgroundColor: barColors,
                data: yValues,
              },
            ],
          },
          options: {
            title: {
              display: false,
              text: 'Spends Graphical View',
            },
          },
        });

        // end chart

        this.monthToDayData = data['totalMonthPeroid'].toFixed(2);

        // last month

        // this.previousMonthCost = lastpreviousMonthCost;

        if (parseFloat(currentMonthCost) >= parseFloat(previousMonthCost)) {
          this.currentMnthCostInc = true;
          this.currentMnthCostDec = false;
        } else if (
          parseFloat(currentMonthCost) < parseFloat(previousMonthCost)
        ) {
          this.currentMnthCostDec = true;
          this.currentMnthCostInc = false;
        }

        let percenForPrev =
          ((currentMonthCost - previousMonthCost) * 100) / currentMonthCost;
        this.percenValForPrev = percenForPrev.toFixed(2);

        let sumOfPrevCost = (currentMonthCost - previousMonthCost).toFixed(2);
        this.sumOfPrevCost = sumOfPrevCost;

        console.log('check prev amount', previousMonthCost);

        this.forecastTotal = (
          (this.monthToDayData * 30) /
          this.calcBetweenDays
        ).toFixed(2);

        this.forecastTotalForChart = (
          (previousMonthCost * 30) /
          this.calcBetweenDays
        ).toFixed(2);

        let currentMnthForecast = this.forecastTotal;
        let previousForcastData = this.forecastTotalForChart;

        let percenForForcast =
          ((currentMnthForecast - previousForcastData) * 100) /
          currentMnthForecast;
        this.percenValForForcast = percenForForcast.toFixed(2);

        console.log(previousMonthCost, 'previous mnth forecast');

        let sumOfForcastCost = (
          currentMnthForecast - previousForcastData
        ).toFixed(2);

        this.sumOfForecastCost = sumOfForcastCost;

        console.log('check sum of forecast', sumOfForcastCost);

        if (
          parseFloat(currentMnthForecast) >= parseFloat(previousForcastData)
        ) {
          this.currentMnthForcastCostInc = true;
          this.currentMnthForecastCostDec = false;
        } else if (
          parseFloat(currentMnthForecast) < parseFloat(previousForcastData)
        ) {
          this.currentMnthForecastCostDec = true;
          this.currentMnthForcastCostInc = false;
        }
      },
      () => {
        this.toastr.error('Something went wrong', 'Error!');
      }
    );
  }

  getAllPayHistory() {
    this.availableAmount = localStorage.getItem('pendingAmount');
    let data = localStorage.getItem('organization');
    this.getPaymentHistory = this.authService.getPaymentHistory(data).subscribe(
      (res) => {
        let data = res['data'];
        let recordLength = data.length;

        console.log('length date', recordLength);
        if (recordLength == 0) {
          this.lastPaidAmount = 0;
          // this.lastPaidDate = 0;
          // this.availableAmount = localStorage.getItem('pendingAmount');
          this.toastr.info('No transaction found', 'Info!');
        } else {
          this.checkPayHistory = false;
          // this.allPayData = data;
          this.lastPaidAmount = data[0]['calculatedCost'];
          this.lastPaidDate = data[0]['creationDate'];
          // this.availableAmount = data[0]['availablePackage'];
          console.log(res['data']);
        }
      },
      () => {
        this.toastr.error('Something went wrong', 'Error!');
      }
    );
    // console.log(this.availableAmount, 'hiii');
  }
}
