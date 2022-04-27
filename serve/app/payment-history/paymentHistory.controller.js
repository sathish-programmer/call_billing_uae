const ORG = require("../organization/organization.model");
const USER = require("../user/user.model");
const PDFDocument = require("pdfkit");
const paymentHistory = require("./paymentHistory.model");
const paymentDB = require("../payment/payment.model");
const moment = require("moment");

const CALL_LOG = require("../call-logs/call-logs.model");

var pdf = require("pdf-creator-node");
var fs = require("fs");

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
    '<html><head><meta charset="utf-8"/></head><body style="padding:0 200px"><div style="float: left"> <p>Organization Name: ' +
    orgName +
    "</p><p>Date: " +
    ceratedDate +
    '</p> </div><div style="float: right"> <p>Available Amount : $' +
    fullAmount +
    "</p><p>Pending Amount : $" +
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
  var csvFile =
    DIR_FOR_PROCESSING +
    orgName +
    "_Reports" +
    "_" +
    new Date().getTime() +
    ".pdf";
  urlToSendBack =
    "downloads/" + orgName + "_Reports" + "_" + new Date().getTime() + ".pdf";
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

  // get current month cost
  let getLastMonthCost = await paymentHistory.find(
    {
      organization: params.orgId,
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
  let body = req.body;

  let orgName = "Imperium";
  let fullAmount = "00";
  let createdDate = "0-0";
  let pendingPay = "00";
  let calculatedCost = "00";
  let getPaymentDet;
  let startDate = new Date(moment(body["startDate"]).utc(true));
  let endDate = new Date(moment(body["endDate"]).utc(true));

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
    pendingPay = getPaymentDet.availablePackage;

    getMonthDocCallLog = await CALL_LOG.find({
      organization: body.orgId,
      softDelete: false,
      paymentFromPackage: true,
      callCostCalculated: true,
      creationDate: {
        $gte: startDate,
        $lte: endDate,
      },
    });
  }

  //pdf gen start
  let dateToShow;
  var html;
  let ceratedDate = new Date().toLocaleDateString();
  // Read HTML Template
  html =
    '<html><head><meta charset="utf-8"/></head><body style="padding:0 200px"><div style="float: left"> <p>Organization Name: ' +
    orgName +
    "</p><p>Generated Date: " +
    ceratedDate +
    '</p> </div><div style="float: right"> <p>Available Amount : $' +
    fullAmount +
    "</p><p>Total Pending Amount : $" +
    pendingPay +
    "</p>";

  html +=
    "</div><div style='clear:both'><hr><h2> Payment History ( " +
    fromDate +
    " to " +
    toDate +
    " )</h2></div>";

  html +=
    "<table style='width: 100%; text-align: left;border: 1px solid #000; border-collapse: separate;'><thead><th style='border:1px solid #000;'>Payment made</th><th style='border:1px solid #000;'>Caller Number</th><th style='border:1px solid #000;'>Called Number</th><th style='border:1px solid #000;'>Call Duration</th><th style='border:1px solid #000;'>Call Time</th><th style='border:1px solid #000;'>Direction</th><th style='border:1px solid #000;'>Total Cycles</th><th style='border:1px solid #000;'>CostPerCycle</th><th style='border:1px solid #000;'>Calculated Cost</th></thead><tbody>";

  let lastMonthCost = 0;
  let totalCost;

  for (let index of getMonthDocCallLog) {
    // console.log(index);

    totalCost = lastMonthCost + parseFloat(index["CalculatedCost"]);
    lastMonthCost = totalCost;

    let direction;
    let paymentDate = new Date(moment(index["creationDate"]).utc(true));
    let callTime = new Date(moment(index["creationDate"]).utc(true));
    let callTimeShow = formatterTime.format(callTime);
    let showdate = formatter.format(paymentDate);

    if (index["Direction"] == "O") {
      direction = "Outgoing";
    } else {
      direction = "Incoming";
    }

    html +=
      "<tr><td style='border:1px solid #000;'>" +
      showdate +
      "</td><td style='border:1px solid #000;'>" +
      index["Callernumber"] +
      "</td><td style='border:1px solid #000;'>" +
      index["Callednumber"] +
      "</td><td style='border:1px solid #000;'>" +
      index["CallDuration"] +
      "</td><td style='border:1px solid #000;'>" +
      callTimeShow +
      "</td><td style='border:1px solid #000;'>" +
      direction +
      "</td><td style='border:1px solid #000;'>" +
      index["TotalCycles"] +
      "</td><td style='border:1px solid #000;'>" +
      index["CostPerCycle"] +
      "</td><td style='border:1px solid #000;'>$" +
      index["CalculatedCost"] +
      "</td></tr>";
  }

  html +=
    "</tbody><tfoot><tr><th id='total' style='text-align: right;' colspan='8'>Total :</th><th>$" +
    lastMonthCost.toFixed(2) +
    "</th></tr></tfoot>";

  html += "</table>";

  html += "</body></html>";

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
  var csvFile =
    DIR_FOR_PROCESSING +
    orgName +
    "_Reports" +
    "_" +
    new Date().getTime() +
    ".pdf";
  urlToSendBack =
    "downloads/" + orgName + "_Reports" + "_" + new Date().getTime() + ".pdf";
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

  return res.json({
    success: true,
    pdfUrl: urlToSendBack,
    data: "",
    paymentDetails: getPaymentDet,
    paymentHistory: getMonthDocPayHis,
    calllogs: getMonthDocCallLog,
  });
};
