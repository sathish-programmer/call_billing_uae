const ORG = require("../organization/organization.model");
const USER = require("../user/user.model");
const PDFDocument = require("pdfkit");
const paymentHistory = require("./paymentHistory.model");
const paymentDB = require("../payment/payment.model");
const moment = require("moment");
const inlineCSS = require("inlinecss");
const CALL_LOG = require("../call-logs/call-logs.model");
const htmtToPdf = require("html-pdf");

var pdf = require("pdf-creator-node");
var fs = require("fs");
const { clear } = require("console");

exports.savePayment = async (req, res) => {
  return res.json({
    success: true,
    data: "test",
  });
};

let lastFiveMonths = [];
// get history list
exports.list = async (req, res) => {
  try {
    let params = req.params;
    let paymentHistoryDet = await paymentHistory
      .find({
        organization: params.orgId,
        isCostCalculated: true,
        softDelete: false,
      })
      .sort({ _id: -1 });

    return res.json({
      success: true,
      data: paymentHistoryDet,
      message: "Payment history retrieved",
    });
  } catch (e) {
    return res.json({
      success: false,
      data: e,
    });
  }
};

// download pdf
exports.generatePdf = async (req, res) => {
  let params = req.params;
  let getDoc = await paymentHistory.findOne({
    uniqueId: params.uniqueId,
    softDelete: false,
  });
  let orgName;
  let fullAmount;
  let createdDate;
  let pendingPay;
  let resultPayHis = getDoc;
  let result = [];
  let getPaymentDet;
  if (getDoc) {
    getPaymentDet = await paymentDB
      .findOne({
        organization: getDoc.organization,
        softDelete: false,
      })
      .populate("calllogs");
    fullAmount = getPaymentDet.package;
    orgName = getPaymentDet.orgName;
    createdDate = getPaymentDet.costPaidDate;
    pendingPay = getDoc.availablePackage;
  }

  let dateToShow;
  let ceratedDate = new Date().toLocaleDateString();
  // Read HTML Template
  var html =
    '<html><head><meta charset="utf-8"/></head><body style="padding:0 200px"><div style="float: left"> <p style="text-transform: capitalize;">Organization Name: ' +
    orgName +
    "</p><p>Date: " +
    ceratedDate +
    '</p> </div><div style="float: right"> <p>Available Credit : $' +
    pendingPay +
    "</p><p>Pending Credit : $" +
    pendingPay +
    "</p></div><div style='clear:both'><hr><p> Calculated Cost: $" +
    getDoc.calculatedCost +
    "</p></div></body></html>";

  var options = {
    format: "A3",
    orientation: "portrait",
    border: "10mm",
    header: {
      height: "45mm",
      contents:
        '<div style="text-align: center;font-size:30px">Payment Overview</div>',
    },
    footer: {
      height: "10mm",
      contents: {
        first: "Page 1",
        2: "Page 2", // Any page number is working. 1-based index
        default:
          '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>', // fallback value
        last: "Last Page",
      },
    },
  };

  var dir_process = "files/";
  var urlToSendBack;
  var DIR_FOR_PROCESSING = global.globalPath + "/public/downloads/";
  if (!fs.existsSync(DIR_FOR_PROCESSING)) {
    fs.mkdirSync(DIR_FOR_PROCESSING);
  }
  let pdfFileName = orgName.trim();
  var csvFile =
    DIR_FOR_PROCESSING +
    pdfFileName +
    "_Reports" +
    "_" +
    new Date().getTime() +
    ".pdf";
  urlToSendBack =
    "downloads/" +
    pdfFileName +
    "_Reports" +
    "_" +
    new Date().getTime() +
    ".pdf";
  var document = {
    html: html,
    data: {
      users: "test",
    },
    path: csvFile,
    type: "",
  };
  pdf
    .create(document, options)
    .then((res) => {
      console.log(res);
    })
    .catch((error) => {
      console.error(error);
    });

  result.orgName = orgName;
  result.fullAmount = fullAmount;
  return res.json({
    success: true,
    data: getPaymentDet,
    url: urlToSendBack,
    uniqueId: params.uniqueId,
  });
};

// get data based on month
exports.lastMonthRecord = async (req, res) => {
  let params = req.params;

  let currentDate = new Date();
  let firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

  //last month
  var dateCheck = new Date();
  var lastMonthFirstDay = new Date(
    dateCheck.getFullYear(),
    dateCheck.getMonth() - 1,
    1
  );
  var lastMonthLastDay = new Date(
    dateCheck.getFullYear(),
    dateCheck.getMonth(),
    0
  );

  //last month 1
  var lastMonthFirstDayOne = new Date(
    dateCheck.getFullYear(),
    dateCheck.getMonth() - 2,
    1
  );
  var lastMonthLastDayOne = new Date(
    dateCheck.getFullYear(),
    dateCheck.getMonth() - 1
  );

  //last month 2
  var lastMonthFirstDayTwo = new Date(
    dateCheck.getFullYear(),
    dateCheck.getMonth() - 3,
    1
  );
  var lastMonthLastDayTwo = new Date(
    dateCheck.getFullYear(),
    dateCheck.getMonth() - 2
  );
  //last month 3
  var lastMonthFirstDayThree = new Date(
    dateCheck.getFullYear(),
    dateCheck.getMonth() - 4,
    1
  );
  var lastMonthLastDayThree = new Date(
    dateCheck.getFullYear(),
    dateCheck.getMonth() - 3
  );

  let currencySymbolShow;

  let findCurrency = await paymentDB.findOne({
    organization: params.orgId.trim(),
    softDelete: false,
  });

  if (findCurrency) {
    currencySymbolShow = findCurrency.currencySymbol;
  }

  // get current month cost
  let getLastMonthCost = await paymentHistory.find(
    {
      organization: params.orgId.trim(),
      softDelete: false,
      creationDate: {
        $gte: firstDay,
        $lt: currentDate,
      },
    },
    "calculatedCost"
  );

  // get last month cost
  let getPrevousMonthCost = await paymentHistory.find(
    {
      organization: params.orgId,
      softDelete: false,
      creationDate: {
        $gte: lastMonthFirstDay,
        $lt: lastMonthLastDay,
      },
    },
    "calculatedCost"
  );

  // get last month cost one
  let getPrevousMonthCostOne = await paymentHistory.find(
    {
      organization: params.orgId,
      softDelete: false,
      creationDate: {
        $gte: lastMonthFirstDayOne,
        $lt: lastMonthLastDayOne,
      },
    },
    "calculatedCost"
  );

  // get last month cost two
  let getPrevousMonthCostTwo = await paymentHistory.find(
    {
      organization: params.orgId,
      softDelete: false,
      creationDate: {
        $gte: lastMonthFirstDayTwo,
        $lt: lastMonthLastDayTwo,
      },
    },
    "calculatedCost"
  );

  // get last month cost threee
  let getPrevousMonthCostThree = await paymentHistory.find(
    {
      organization: params.orgId,
      softDelete: false,
      creationDate: {
        $gte: lastMonthFirstDayThree,
        $lt: lastMonthLastDayThree,
      },
    },
    "calculatedCost"
  );

  let lastMonthCost = 0;
  let totalCost;

  let BeforelastMonthCost = 0;
  let totalCostLastMnth;

  let BeforelastMonthCostOne = 0;
  let totalCostLastMnthOne;

  let BeforelastMonthCostTwo = 0;
  let totalCostLastMnthTwo;

  let BeforelastMonthCostThree = 0;
  let totalCostLastMnthThree;

  for (let index in getLastMonthCost) {
    totalCost =
      lastMonthCost + parseFloat(getLastMonthCost[index]["calculatedCost"]);
    lastMonthCost = totalCost;
  }

  for (let index in getPrevousMonthCost) {
    totalCostLastMnth =
      BeforelastMonthCost +
      parseFloat(getPrevousMonthCost[index]["calculatedCost"]);
    BeforelastMonthCost = totalCostLastMnth;
  }

  for (let index in getPrevousMonthCostOne) {
    totalCostLastMnthOne =
      BeforelastMonthCostOne +
      parseFloat(getPrevousMonthCostOne[index]["calculatedCost"]);
    BeforelastMonthCostOne = totalCostLastMnthOne;
  }

  for (let index in getPrevousMonthCostTwo) {
    totalCostLastMnthTwo =
      BeforelastMonthCostTwo +
      parseFloat(getPrevousMonthCostTwo[index]["calculatedCost"]);
    BeforelastMonthCostTwo = totalCostLastMnthTwo;
  }

  for (let index in getPrevousMonthCostThree) {
    totalCostLastMnthThree =
      BeforelastMonthCostThree +
      parseFloat(getPrevousMonthCostThree[index]["calculatedCost"]);
    BeforelastMonthCostThree = totalCostLastMnthThree;
  }

  let results = {};
  let resultNew = {};

  if (totalCost > 0) {
    results.totalMonthPeroid = totalCost;
    resultNew.currentMonthCost = totalCost;
  } else {
    results.totalMonthPeroid = 0;
    resultNew.currentMonthCost = 0;
  }

  if (totalCostLastMnth > 0) {
    resultNew.lastMonthCost = totalCostLastMnth;
  } else {
    resultNew.lastMonthCost = 0;
  }
  if (totalCostLastMnthTwo > 0) {
    resultNew.beforeLastPreviousMonthCost = totalCostLastMnthTwo;
  } else {
    resultNew.beforeLastPreviousMonthCost = 0;
  }
  if (totalCost > 0) {
    resultNew.currentMonthCost = totalCost;
  } else {
    resultNew.currentMonthCost = 0;
  }
  if (totalCostLastMnthThree > 0) {
    resultNew.PreviousFifthMonthCost = totalCostLastMnthThree;
  } else {
    resultNew.PreviousFifthMonthCost = 0;
  }

  if (totalCostLastMnthOne > 0) {
    resultNew.lastPreviousMonthCost = totalCostLastMnthOne;
  } else {
    resultNew.lastPreviousMonthCost = 0;
  }

  // res.send(getLastMonthCost.calculatedCost);
  return res.json({
    success: true,
    data: results,
    costForMonth: resultNew,
    currencySymbol: currencySymbolShow,
  });
};

exports.monthRecord = async (req, res) => {
  let params = req.params;
  // curent month
  let currentDate = new Date();
  let firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

  var dateCheck = new Date();
  var lastMonthFirstDay = new Date(
    dateCheck.getFullYear(),
    dateCheck.getMonth() - 1,
    1
  );
  var lastMonthLastDay = new Date(
    dateCheck.getFullYear(),
    dateCheck.getMonth(),
    0
  );

  //last month 1
  var lastMonthFirstDayOne = new Date(
    dateCheck.getFullYear(),
    dateCheck.getMonth() - 2,
    1
  );
  var lastMonthLastDayOne = new Date(
    dateCheck.getFullYear(),
    dateCheck.getMonth() - 1
  );

  //last month 2
  var lastMonthFirstDayTwo = new Date(
    dateCheck.getFullYear(),
    dateCheck.getMonth() - 3,
    1
  );
  var lastMonthLastDayTwo = new Date(
    dateCheck.getFullYear(),
    dateCheck.getMonth() - 2
  );
  //last month 3
  var lastMonthFirstDayThree = new Date(
    dateCheck.getFullYear(),
    dateCheck.getMonth() - 4,
    1
  );
  var lastMonthLastDayThree = new Date(
    dateCheck.getFullYear(),
    dateCheck.getMonth() - 3
  );

  // get current month cost
  let getLastMonthCost = await paymentHistory.find(
    {
      organization: params.orgId,
      softDelete: false,
      creationDate: {
        $gte: firstDay,
        $lt: currentDate,
      },
    },
    "calculatedCost"
  );

  // get last month cost
  let getPrevousMonthCost = await paymentHistory.find(
    {
      organization: params.orgId,
      softDelete: false,
      creationDate: {
        $gte: lastMonthFirstDay,
        $lt: lastMonthLastDay,
      },
    },
    "calculatedCost"
  );

  // get last month cost one
  let getPrevousMonthCostOne = await paymentHistory.find(
    {
      organization: params.orgId,
      softDelete: false,
      creationDate: {
        $gte: lastMonthFirstDayOne,
        $lt: lastMonthLastDayOne,
      },
    },
    "calculatedCost"
  );

  // get last month cost two
  let getPrevousMonthCostTwo = await paymentHistory.find(
    {
      organization: params.orgId,
      softDelete: false,
      creationDate: {
        $gte: lastMonthFirstDayTwo,
        $lt: lastMonthLastDayTwo,
      },
    },
    "calculatedCost"
  );

  // get last month cost threee
  let getPrevousMonthCostThree = await paymentHistory.find(
    {
      organization: params.orgId,
      softDelete: false,
      creationDate: {
        $gte: lastMonthFirstDayThree,
        $lt: lastMonthLastDayThree,
      },
    },
    "calculatedCost"
  );

  let lastMonthCost = parseFloat(0);
  let totalCost;

  let BeforelastMonthCost = 0;
  let totalCostLastMnth;

  let BeforelastMonthCostOne = 0;
  let totalCostLastMnthOne;

  let BeforelastMonthCostTwo = 0;
  let totalCostLastMnthTwo;

  let BeforelastMonthCostThree = 0;
  let totalCostLastMnthThree;

  for (let index in getLastMonthCost) {
    totalCost =
      lastMonthCost + parseFloat(getLastMonthCost[index]["calculatedCost"]);
    lastMonthCost = totalCost;
  }

  for (let index in getPrevousMonthCost) {
    totalCostLastMnth =
      BeforelastMonthCost +
      parseFloat(getPrevousMonthCost[index]["calculatedCost"]);
    BeforelastMonthCost = totalCostLastMnth;
  }

  for (let index in getPrevousMonthCostOne) {
    totalCostLastMnthOne =
      BeforelastMonthCostOne +
      parseFloat(getPrevousMonthCostOne[index]["calculatedCost"]);
    BeforelastMonthCostOne = totalCostLastMnthOne;
  }

  for (let index in getPrevousMonthCostTwo) {
    totalCostLastMnthTwo =
      BeforelastMonthCostTwo +
      parseFloat(getPrevousMonthCostTwo[index]["calculatedCost"]);
    BeforelastMonthCostTwo = totalCostLastMnthTwo;
  }

  for (let index in getPrevousMonthCostThree) {
    totalCostLastMnthThree =
      BeforelastMonthCostThree +
      parseFloat(getPrevousMonthCostThree[index]["calculatedCost"]);
    BeforelastMonthCostThree = totalCostLastMnthThree;
  }

  let results = {};
  let resultNew = {};

  if (totalCost > 0) {
    results.totalMonthPeroid = totalCost;
    resultNew.currentMonthCost = totalCost;
  } else {
    results.totalMonthPeroid = 0;
    resultNew.currentMonthCost = 0;
  }

  if (totalCostLastMnth > 0) {
    resultNew.lastMonthCost = totalCostLastMnth;
  } else {
    resultNew.lastMonthCost = 0;
  }
  if (totalCostLastMnthTwo > 0) {
    resultNew.beforeLastPreviousMonthCost = totalCostLastMnthTwo;
  } else {
    resultNew.beforeLastPreviousMonthCost = 0;
  }
  if (totalCost > 0) {
    resultNew.currentMonthCost = totalCost;
  } else {
    resultNew.currentMonthCost = 0;
  }
  if (totalCostLastMnthThree > 0) {
    resultNew.PreviousFifthMonthCost = totalCostLastMnthThree;
  } else {
    resultNew.PreviousFifthMonthCost = 0;
  }

  if (totalCostLastMnthOne > 0) {
    resultNew.lastPreviousMonthCost = totalCostLastMnthOne;
  } else {
    resultNew.lastPreviousMonthCost = 0;
  }

  let data = {
    currentMonth: {
      name: lastFiveMonths[0],
      costPaid: lastMonthCost,
      startDate: firstDay,
      endDate: currentDate,
    },
    previousMonth: {
      name: lastFiveMonths[1],
      costPaid: BeforelastMonthCost,
      startDate: lastMonthFirstDay,
      endDate: lastMonthLastDay,
    },
    thirdPreviousMonth: {
      name: lastFiveMonths[2],
      costPaid: BeforelastMonthCostOne,
      startDate: lastMonthFirstDayOne,
      endDate: lastMonthLastDayOne,
    },
    fourthPreviousMonth: {
      name: lastFiveMonths[3],
      costPaid: BeforelastMonthCostTwo,
      startDate: lastMonthFirstDayTwo,
      endDate: lastMonthLastDayTwo,
    },
    fifthPreviousMonth: {
      name: lastFiveMonths[4],
      costPaid: BeforelastMonthCostThree,
      startDate: lastMonthFirstDayThree,
      endDate: lastMonthLastDayThree,
    },
  };

  return res.json({
    success: true,
    data: data,
  });
};

let getLastFiveMonths = () => {
  var monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
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

    lastFiveMonths.push(monthNames[month]);
    // console.log(this.lastFiveMonths);
    month--;
    i++;
  } while (i < 5);
};
getLastFiveMonths();

exports.generatePdfByMonth = async (req, res) => {
  try {
    let body = req.body;

    let orgName = "-";
    let fullAmount = "00";
    let createdDate = "0-0";
    let pendingPay = "00";
    let calculatedCost = "00";
    let getPaymentDet;
    let currencySymbol;
    let startDate = new Date(moment(body["startDate"]).utc(true));
    let endDate = new Date(moment(body["endDate"]).utc(true));

    let dateFrom =
      moment(startDate).utc().format("L") +
      " " +
      moment(startDate).utc().format("LT");
    let dateTo =
      moment(endDate).utc().format("L") +
      " " +
      moment(endDate).utc().format("LT");

    let pdfStartDate = startDate;
    let pdfEndDate = endDate;

    let formatter = Intl.DateTimeFormat(
      "default", // a locale name; "default" chooses automatically
      {
        year: "numeric",
        month: "short",
        day: "numeric",
        // hour: "numeric",
        // minute: "numeric",
      }
    );

    let formatterTime = Intl.DateTimeFormat(
      "default", // a locale name; "default" chooses automatically
      {
        // year: "numeric",
        // month: "short",
        // day: "numeric",
        hour: "numeric",
        minute: "numeric",
      }
    );

    let fromDate = formatter.format(startDate);
    let toDate = formatter.format(endDate);

    let getMonthDocPayHis = await paymentHistory
      .find({
        organization: body.orgId,
        softDelete: false,
        creationDate: {
          $gte: pdfStartDate,
          $lte: pdfEndDate,
        },
      })
      .sort({ _id: -1 });
    let getMonthDocCallLog;
    if (getMonthDocPayHis) {
      getPaymentDet = await paymentDB.findOne({
        organization: body.orgId,
        softDelete: false,
      });
      fullAmount = getPaymentDet.package;
      orgName = getPaymentDet.orgName;
      createdDate = getPaymentDet.createdDate;
      // if (getMonthDocPayHis[0]["availablePackage"] != undefined) {
      if (
        getMonthDocPayHis[0]["availablePackage"] !== undefined ||
        getMonthDocPayHis[0]["availablePackage"] !== null
      ) {
        pendingPay = getMonthDocPayHis[0]["availablePackage"];
      }

      // }
      currencySymbol = getPaymentDet.currencySymbol;

      getMonthDocCallLog = await CALL_LOG.find({
        organization: body.orgId,
        softDelete: false,
        paymentFromPackage: true,
        callCostCalculated: true,
        creationDate: {
          $gte: startDate,
          $lte: endDate,
        },
      })
        .populate("branch", "name")
        .populate("department", "name")
        .populate("callerUser", "firstName lastName")
        .populate("calledUser", "firstName lastName")
        .sort({ _id: -1 })
        .lean();
    }

    //pdf gen start
    let dateToShow;
    var html;
    let ceratedDate = moment().format("L") + " " + moment().format("LT");
    // Read HTML Template

    html = `<html xmlns="http://www.w3.org/1999/xhtml">
  <head>
     <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
     <title></title>
     <script defer src="/static/fontawesome/fontawesome-all.js"></script>
  </head>
  <body style="padding: 0; margin: 0; background-repeat: repeat; width: 100% !important; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; -webkit-font-smoothing: antialiased;"><table width="1100" cellspacing="0" cellpadding="0" align="center" style="background:#fff;font-family: Arial, Helvetica, sans-serif;font-size: 14px;font-style: normal;font-weight: normal;line-height: 22px;word-break: break-word;color: #444;text-align: left;border-bottom:1px solid #666">
  <tbody>
     <tr>
        <td colspan="6" style="padding: 15px 0 10px;font-size: 22px;font-weight: bold; text-align: center;">
        Payment Utilization Cycle
        </td>
     </tr>
     <tr>
        <td style="padding: 25px 0 10px;font-size: 16px;font-weight: bold;">
        Organization Name: 
           <span style="font-weight: normal;padding-left: 5px;">
           ${orgName}
           </span>
        </td>     
        
        <td style="padding: 25px 0px 0 200px;font-size: 16px;font-weight: bold;">
        Available Credit : 
           <span style="font-weight: normal;padding-left: 5px;">
           ${currencySymbol} ${pendingPay}
           </span>
        </td>
     </tr>
     <tr >
        <td style="padding: 25px 0 10px;font-size: 16px;font-weight: bold;">
        Payment Utilization History from     
           ${dateFrom} to ${dateTo}
        </td>    
        
        <td style="padding: 25px 0px 0 200px;font-size: 16px;font-weight: bold;">
        Printed On : 
           <span style="font-weight: normal;padding-left: 5px;">
           ${ceratedDate}
           </span>
        </td>
     </tr>
  </tbody>
</table><br/>`;

    html +=
      "<table width='1100' border='0' cellspacing='0' cellpadding='0' align='center' style='background:#fff;font-family: Arial, Helvetica, sans-serif;font-size: 14px;font-style: normal;font-weight: normal;line-height: 22px;word-break: break-word;color: #333;text-align: center;   border: 1px solid #999;   border-collapse: collapse;'><tbody><tr style='background:#ddd;'><td style='padding:10px 5px;border: 1px solid #999;border-collapse: collapse;'>Branch</td><td style='padding:10px 5px;border: 1px solid #999;border-collapse: collapse;'>Department</td><td style='padding:10px 5px;border: 1px solid #999;border-collapse: collapse;'>Caller Number</td><td style='padding:10px 5px;border: 1px solid #999;border-collapse: collapse;'>Called Number</td><td style='padding:10px 5px;border: 1px solid #999;border-collapse: collapse;'>Call Duration</td><td style='padding:10px 5px;border: 1px solid #999;border-collapse: collapse;'>Call Time</td><td style='padding:10px 5px;border: 1px solid #999;border-collapse: collapse;'>Direction</td><td style='padding:10px 5px;border: 1px solid #999;border-collapse: collapse;'>Total Cycle</td><td style='padding:10px 5px;border: 1px solid #999;border-collapse: collapse;'>CostPerCycle</td><td style='padding:10px 5px;border: 1px solid #999;border-collapse: collapse;'>Paid Credit</td></tr><tbody>";

    let lastMonthCost = 0;
    let totalCost;

    for (let index of getMonthDocCallLog) {
      let branchName = index["branch"] ? index["branch"]["name"] : "";

      let deptName = index["department"] ? index["department"]["name"] : "";
      let callerName = index["callerUser"]
        ? index["callerUser"]["firstName"]
        : "";
      let CalledName = index["calledUser"]
        ? index["calledUser"]["firstName"]
        : "";

      totalCost = lastMonthCost + parseFloat(index["CalculatedCost"]);
      lastMonthCost = totalCost;

      let direction;
      let paymentDate = new Date(moment(index["creationDate"]).utc(true));
      let callTime = new Date(moment(index["creationDate"]).utc(true));
      // let callTimeShow = formatterTime.format(callTime);
      let showdate = formatter.format(paymentDate);
      let CallDuration = secondsToDHMS(index["CallDuration"]);

      let callTimeShow =
        moment(index["CallTime"]).utc().format("L") +
        " " +
        moment(index["CallTime"]).utc().format("LT");

      if (index["Direction"] == "O") {
        direction = "Outgoing";
      } else {
        direction = "Incoming";
      }

      let totalCostCal = index["CalculatedCost"].toFixed(2);

      if (index["CalculatedCost"] > 0) {
        html +=
          "<tr style='background:#fff;'><td style='padding:10px 5px;'>" +
          branchName +
          "</td><td style='padding:10px 5px;'>" +
          deptName +
          "</td><td style='padding:10px 5px;'>" +
          index["Callernumber"] +
          "</td><td style='padding:10px 5px;'>" +
          index["Callednumber"] +
          "</td><td style='padding:10px 5px;'>" +
          CallDuration +
          "</td><td style='padding:10px 5px;'>" +
          callTimeShow +
          "</td><td style='padding:10px 5px;'>" +
          direction +
          "</td><td style='padding:10px 5px;'>" +
          index["TotalCycles"] +
          "</td><td style='padding:10px 5px;'>" +
          index["CostPerCycle"] +
          "</td><td style='padding:10px 5px;'>" +
          currencySymbol +
          " " +
          totalCostCal +
          "</td></tr>";
      }
    }

    html += `<tr style="background:#fff;"><td colspan="10" style="padding:10px 20px;border-top: 1px solid #666;border-collapse: collapse; text-align:right;">
  <b>Total Amount : </b>
  <span> ${currencySymbol} ${lastMonthCost.toFixed(2)}</span>
</td></tr>`;

    html += "</tbody></table>";

    //     html += `<br/>
    //   <table width="1100" border="0" cellspacing="0" cellpadding="0" align="center" style="background:#fff;font-family: Arial, Helvetica, sans-serif;font-size: 14px;font-style: normal;font-weight: normal;line-height: 10px;word-break: break-word;color: #333;text-align: left;   ">
    //     <tbody>
    //        <tr>
    //           <td style="padding: 25px 0 10px;font-size: 16px;font-weight: bold;">

    //              <span style="font-weight: normal;padding-left: 5px;">
    //              ** Balance Credit = ( Available Credit - Total Paid Credit )
    //              </span>
    //           </td>
    //           <td style="padding: 25px 0px 0 400px;font-size: 16px;font-weight: bold;">
    //           Balance Credit :
    //            <span style="font-weight: normal;padding-left: 5px;">
    //            ${currencySymbol} ${(pendingPay - lastMonthCost).toFixed(2)}
    //            </span>
    //         </td>
    //        </tr>

    //     </tbody>
    //  </table> `;

    html += "</body></html>";

    var dir_process = "files/";
    var urlToSendBack;
    var DIR_FOR_PROCESSING = global.globalPath + "/public/downloads/";
    if (!fs.existsSync(DIR_FOR_PROCESSING)) {
      fs.mkdirSync(DIR_FOR_PROCESSING);
    }
    var pdfFileToSave =
      DIR_FOR_PROCESSING +
      "callBilling_report" +
      "_" +
      new Date().getTime() +
      ".pdf";
    urlToSendBack =
      "downloads/" + "callBilling_report" + "_" + new Date().getTime() + ".pdf";
    inlineCSS.inlineHtml(html, function (userinlineHtml) {
      htmtToPdf
        .create(userinlineHtml, {
          format: "A3",
          orientation: "landscape",
          type: "pdf",
          width: "1300px",
        })
        .toFile(pdfFileToSave, function (err, response) {
          if (err) {
            console.log("Err", err);
            return res.json({
              success: false,
              data: "",
              message: "Not able to create PDF " + err,
            });
          } else {
            console.log("Response", response);
            return res.json({
              success: true,
              pdfUrl: urlToSendBack,
              data: "",
              paymentDetails: getPaymentDet,
              paymentHistory: getMonthDocPayHis,
              calllogs: getMonthDocCallLog,
            });
          }
        });
    });
  } catch (e) {
    return res.json({
      success: false,
      data: "Try again Later",
    });
  }
};

//Convert Seconds to Day Hours Minute Seconds
function secondsToDHMS(seconds) {
  var msg = "";
  var d = Math.floor(seconds / (24 * 3600)); //Get Whole days
  seconds -= d * (24 * 3600);
  if (d > 0) {
    msg += d + ":";
  }
  var h = Math.floor(seconds / 3600); //Get remaining hours
  if (h > 0) {
    msg += (h < 10 ? "0" + h : h) + ":";
  } else {
    msg += "00:";
  }
  seconds -= h * 3600;
  var m = Math.floor(seconds / 60); //Get remaining minutes
  if (m > 0) {
    msg += (m < 10 ? "0" + m : m) + ":";
  } else {
    msg += "00:";
  }
  seconds -= m * 60;
  if (seconds > 0) {
    msg += seconds < 10 ? "0" + seconds : seconds;
  } else {
    msg += "00";
  }
  return msg;
}

// delete api
exports.deletePaymentHis = async (req, res) => {
  let params = req.params;

  if (params.paymentId) {
    let delTable = await paymentHistory.updateMany(
      { softDelete: false },
      { $set: { softDelete: true } }
    );

    if (delTable) {
      return res.json({
        success: true,
        data: params.paymentId,
        message: "Payment linked with the organization Deleted",
      });
    } else {
      return res.json({
        success: false,
        data: params.paymentId,
        message: "Something went wrong",
      });
    }
  }
};
