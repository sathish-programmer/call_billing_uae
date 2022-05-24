const CALL_LOG = require("../call-logs/call-logs.model");
const USER = require("../user/user.model");
const moment = require("moment");
const fs = require("fs");
const { parse } = require("json2csv");
const htmtToPdf = require("html-pdf");
const inlineCSS = require("inlinecss");
const _ = require("underscore");
const mongoose = require("mongoose");
const { rawListeners } = require("process");
// Get the call report for the Call Report page
exports.getCallReport = async (req, res) => {
  try {
    let body = req.body;
    let params = req.params;

    if (params && params["orgId"] && body["startDate"] && body["endDate"]) {
      let retData = await toGetReportData(body, params, true);
      return res.json(retData);
    } else {
      return res.json({ success: false, data: "", message: "Missing data" });
    }
  } catch (err) {
    console.log("Error while saving reports filter", err);
    return res.json({ succes: false, data: "", message: err });
  }
};

exports.getCallReportExtension = async (req, res) => {
  try {
    let body = req.body;
    let params = req.params;

    if (params && params["orgId"] && body["startDate"] && body["endDate"]) {
      let retData = await toGetReportDataByExt(body, params, true);
      return res.json(retData);
    } else {
      return res.json({ success: false, data: "", message: "Missing data" });
    }
  } catch (err) {
    console.log("Error while saving reports filter", err);
    return res.json({ succes: false, data: "", message: err });
  }
};

// Download CSV File functionality
exports.downloadCallReportCSVFile = async (req, res) => {
  try {
    let body = req.body;
    let params = req.params;
    let retData;

    if (
      params &&
      params["orgId"] &&
      body["startDate"] &&
      body["endDate"] &&
      body["fileName"]
    ) {
      retData = await toGetReportData(body, params, false);
    } else {
      return res.json({ success: false, data: "", message: "Missing data" });
    }

    let fields = [
      "branchName",
      "departmentName",
      "CallTime",
      "Ringduration",
      "CallDuration",
      "Direction",
      "Callernumber",
      "CallerName",
      "Callednumber",
      "CalledName",
      "CalculatedCost",
      "CallAnswered",
    ];

    let fieldNames = [
      "Branch",
      "Department",
      "Call Time",
      "Ring Duration",
      "Call Duration",
      "Direction",
      "Caller Number",
      "Caller Name",
      "Called Number",
      "Called Name",
      "Cost",
      "Call Answered",
    ];

    if (retData && retData["query"] && retData["query"].length) {
      var csv = parse(retData["query"], { fields });

      var DIR_FOR_PROCESSING = global.globalPath + "/public/downloads/";
      if (!fs.existsSync(DIR_FOR_PROCESSING)) {
        fs.mkdirSync(DIR_FOR_PROCESSING);
      }

      var csvFile =
        DIR_FOR_PROCESSING +
        retData["fileName"] +
        "_" +
        new Date().getTime() +
        ".csv";
      urlToSendBack =
        "downloads/" +
        retData["fileName"] +
        "_" +
        new Date().getTime() +
        ".csv";
      let retDoc = fs.writeFileSync(csvFile, csv);

      return res.json({
        success: true,
        data: { url: urlToSendBack },
        message: "URL for the CSV file",
      });
    } else {
      return { success: false, message: "No data found", status: 200 };
    }
  } catch (err) {
    console.log("Error while saving reports filter", err);
    return res.json({ succes: false, data: "", message: err });
  }
};

// Download call report in PDF format functionality
exports.downdloadCallReportPDFFile = async (req, res) => {
  try {
    let body = req.body;
    let params = req.params;
    let retData;

    if (
      params &&
      params["orgId"] &&
      body["startDate"] &&
      body["endDate"] &&
      body["fileName"]
    ) {
      retData = await toGetReportData(body, params, false);
    } else {
      return res.json({ success: false, data: "", message: "Missing data" });
    }

    if (retData && retData["query"] && retData["query"].length) {
      htmlForReport = `  <html xmlns="http://www.w3.org/1999/xhtml">
                       <head>
                          <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
                          <title></title>
                          <script defer src="/static/fontawesome/fontawesome-all.js"></script>
                       </head>
                       <body style="padding: 0; margin: 0; background-repeat: repeat; width: 100% !important; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; -webkit-font-smoothing: antialiased;">
                          <table width="1100" border="0" cellspacing="0" cellpadding="0" align="center" style="background:#fff;font-family: Arial, Helvetica, sans-serif;font-size: 14px;font-style: normal;font-weight: normal;line-height: 22px;word-break: break-word;color: #444;text-align: left;">
                             <tbody>
                                <tr>
                                   <td colspan="6" style="padding: 15px 0 10px;font-size: 22px;font-weight: bold;     text-align: center;">
                                     Detailed Report
                                   </td>
                                </tr>
                                <tr>
                                   <td style="padding: 25px 0 10px;font-size: 16px;font-weight: bold;">
                                      Date :
                                      <span style="font-weight: normal;padding-left: 5px;">
                                      ${retData.DateFrom} - ${retData.DateTo}
                                      </span>
                                   </td>               
                                </tr>
                             </tbody>
                          </table>
                          <table width="1100" border="0" cellspacing="0" cellpadding="0" align="center" style="background:#fff;font-family: Arial, Helvetica, sans-serif;font-size: 14px;font-style: normal;font-weight: normal;line-height: 22px;word-break: break-word;color: #333;text-align: center;   border: 1px solid #999;   border-collapse: collapse;">
                             <tbody>
                                <tr style="background:#ddd;">
                                   <td style="padding:10px 5px;border: 1px solid #999;border-collapse: collapse;">
                                      Call start
                                   </td>
                                   <td style="padding:10px 5px;border: 1px solid #999; border-collapse: collapse;">
                                      Ring Dur
                                   </td>
                                   <td style="padding:10px 5px;border: 1px solid #999;border-collapse: collapse;">
                                      Call Duration
                                   </td>
                                   <td style="padding:10px 5px;border: 1px solid #999; border-collapse: collapse;">
                                      Direction
                                   </td>
                                   <td style="padding:10px 5px;border: 1px solid #999;border-collapse: collapse;">
                                      Caller
                                   </td>
                                   <td style="padding:10px 5px;border: 1px solid #999;border-collapse: collapse;">
                                      Caller Name
                                   </td>
                                   <td style="padding:10px 5px;border: 1px solid #999;border-collapse: collapse;">
                                      Called No
                                   </td>
                                   <td style="padding:10px 5px;border: 1px solid #999;border-collapse: collapse;">
                                      Called Name
                                   </td>
                                   <td style="padding:10px 5px;border: 1px solid #999;border-collapse: collapse;">
                                      Amt
                                   </td>
                                   <td style="padding:10px 5px;border: 1px solid #999;border-collapse: collapse;">
                                      Ans
                                   </td>
                                  
                                </tr>`;

      htmlForReportSummary = `  <html xmlns="http://www.w3.org/1999/xhtml">
                                <head>
                                   <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
                                   <title></title>
                                   <script defer src="/static/fontawesome/fontawesome-all.js"></script>
                                </head>
                                <body style="padding: 0; margin: 0; background-repeat: repeat; width: 100% !important; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; -webkit-font-smoothing: antialiased;">
                                   <table width="1100" border="0" cellspacing="0" cellpadding="0" align="center" style="background:#fff;font-family: Arial, Helvetica, sans-serif;font-size: 14px;font-style: normal;font-weight: normal;line-height: 22px;word-break: break-word;color: #444;text-align: left;">
                                      <tbody>
                                         <tr>
                                            <td colspan="6" style="padding: 15px 0 10px;font-size: 22px;font-weight: bold;     text-align: center;">
                                              Summary Report
                                            </td>
                                         </tr>
                                         <tr>
                                            <td style="padding: 25px 0 10px;font-size: 16px;font-weight: bold;">
                                               Date :
                                               <span style="font-weight: normal;padding-left: 5px;">
                                               ${retData.DateFrom} - ${retData.DateTo}
                                               </span>
                                            </td>               
                                         </tr>
                                      </tbody>
                                   </table>
                                   <table width="1100" border="0" cellspacing="0" cellpadding="0" align="center" style="background:#fff;font-family: Arial, Helvetica, sans-serif;font-size: 14px;font-style: normal;font-weight: normal;line-height: 22px;word-break: break-word;color: #333;text-align: center;   border: 1px solid #999;   border-collapse: collapse;">
                                     `;
      for (let index = 0; index < retData.query.length; index++) {
        let singleCall = retData["query"][index];
        htmlForReport += ` <tr style="background:#fff;" >
                              <td style="padding:10px 5px;">
                                ${singleCall.CallTime}
                              </td>
                              <td style="padding:10px 5px;">
                                ${singleCall.Ringduration}
                              </td>
                              <td style="padding:10px 5px;">
                                ${singleCall.CallDuration}
                              </td>
                              <td style="padding:10px 5px;">
                                ${singleCall.Direction}
                              </td>
                              <td style="padding:10px 5px;">
                                ${singleCall.Callernumber}
                              </td>
                              <td style="padding:10px 5px;">
                                ${singleCall.CallerName}
                              </td>
                              <td style="padding:10px 5px;text-align:center">
                                ${singleCall.Callednumber}
                              </td>
                              <td style="padding:10px 5px;">
                                ${singleCall.CalledName}
                              </td>
                              <td style="padding:10px 5px;text-align:center">
                                ${
                                  singleCall.CalculatedCost
                                    ? singleCall.CalculatedCost
                                    : "-"
                                }
                              </td>
                              <td style="padding:10px 5px;text-align:center">
                                ${singleCall.CallAnswered}
                              </td>                              
                          </tr>`;
      }

      htmlForReport += `<tr style="background:#fff;">
                                  <td colspan="2" style="padding:10px 5px;border-top: 1px solid #666; border-collapse: collapse; text-align:left;">
                                    <b>Total Calls : </b>
                                    <span>${retData.TotalCalls} </span>
                                  </td>
                                  <td colspan="3" style="padding:10px 5px;border-top: 1px solid #666;border-collapse: collapse; text-align:left;">
                                    <b>Total Duration : </b>
                                    <span>${retData.TotalDuration} </span>
                                  </td>
                                  <td colspan="3" style="padding:10px 5px;border-top: 1px solid #666;border-collapse: collapse; text-align:left;">
                                    <b>Total Seconds : </b>
                                    <span>${retData.TotalSeconds}</span>
                                  </td>
                                  <td colspan="2" style="padding:10px 5px;border-top: 1px solid #666;border-collapse: collapse; text-align:left;">
                                      <b>Total Amount : </b>
                                      <span>${retData.TotalAmount}</span>
                                    </td>
                                </tr> 
                                 <tr style="background:#fff;"> 
                                    <td colspan="2" style="padding:10px 5px;border-bottom: 1px solid #666;border-collapse: collapse; text-align:left;">
                                        <b>Answered Calls : </b>
                                          <span>${retData.AnsweredCalls} </span>
                                      </td>              
                                   <td colspan="8" style="padding:10px 5px;border-bottom: 1px solid #666;border-collapse: collapse; text-align:left;">
                                      <b>Missed Calls : </b>
                                      <span>${retData.MissedCalls}</span>
                                   </td>
                                </tr> 
                             </tbody>
                          </table>
                          <br/>
                           <table width="1100" border="0" cellspacing="0" cellpadding="0" align="center" style="background:#fff;font-family: Arial, Helvetica, sans-serif;font-size: 14px;font-style: normal;font-weight: normal;line-height: 22px;word-break: break-word;color: #333;text-align: left;    border-top: 1px solid #666;">
                             <tbody>
                                <tr>
                                   <td style="padding: 25px 0 10px;font-size: 16px;font-weight: bold;">
                                      Call Type :
                                      <span style="font-weight: normal;padding-left: 5px;">
                                      ${retData.CallType || "-"}
                                      </span>
                                   </td>
                                   <td style="padding: 25px 0 10px;font-size: 16px;font-weight: bold;">
                                    Printed On :
                                    <span style="font-weight: normal;padding-left: 5px;">
                                    ${retData.Today}
                                    </span>
                                 </td>
                                </tr>
                                <tr>
                                   <td style="padding: 25px 0 10px;font-size: 16px;font-weight: bold;">
                                      Extension :
                                      <span style="font-weight: normal;padding-left: 5px;">
                                      ${retData.AllExtension || "-"}
                                      </span>
                                   </td>
                                </tr>
                             </tbody>
                          </table> 
                       </body>
                    </html>`;

      htmlForReportSummary += `<tr style="background:#fff;">
                                  <td colspan="2" style="padding:10px 5px;border-top: 1px solid #666; border-collapse: collapse; text-align:left;">
                                    <b>Total Calls : </b>
                                    <span>${retData.TotalCalls} </span>
                                  </td>
                                  <td colspan="3" style="padding:10px 5px;border-top: 1px solid #666;border-collapse: collapse; text-align:left;">
                                    <b>Total Duration : </b>
                                    <span>${retData.TotalDuration} </span>
                                  </td>
                                  <td colspan="3" style="padding:10px 5px;border-top: 1px solid #666;border-collapse: collapse; text-align:left;">
                                    <b>Total Seconds : </b>
                                    <span>${retData.TotalSeconds}</span>
                                  </td>
                                  <td colspan="2" style="padding:10px 5px;border-top: 1px solid #666;border-collapse: collapse; text-align:left;">
                                      <b>Total Amount : </b>
                                      <span>${retData.TotalAmount}</span>
                                    </td>
                                </tr> 
                                 <tr style="background:#fff;"> 
                                    <td colspan="2" style="padding:10px 5px;border-bottom: 1px solid #666;border-collapse: collapse; text-align:left;">
                                        <b>Answered Calls : </b>
                                          <span>${retData.AnsweredCalls} </span>
                                      </td>              
                                   <td colspan="8" style="padding:10px 5px;border-bottom: 1px solid #666;border-collapse: collapse; text-align:left;">
                                      <b>Missed Calls : </b>
                                      <span>${retData.MissedCalls}</span>
                                   </td>
                                </tr> 
                             </tbody>
                          </table>
                          <br/>
                           <table width="1100" border="0" cellspacing="0" cellpadding="0" align="center" style="background:#fff;font-family: Arial, Helvetica, sans-serif;font-size: 14px;font-style: normal;font-weight: normal;line-height: 22px;word-break: break-word;color: #333;text-align: left;    border-top: 1px solid #666;">
                             <tbody>
                                <tr>
                                   <td style="padding: 25px 0 10px;font-size: 16px;font-weight: bold;">
                                   Printed On :
                                      <span style="font-weight: normal;padding-left: 5px;">
                                      ${retData.Today}
                                      </span>
                                   </td>
                                  
                                </tr>
                               
                             </tbody>
                          </table> 
                       </body>
                    </html>`;

      var DIR_FOR_PROCESSING = global.globalPath + "/public/downloads/";
      if (!fs.existsSync(DIR_FOR_PROCESSING)) {
        fs.mkdirSync(DIR_FOR_PROCESSING);
      }

      var pdfFileToSave =
        DIR_FOR_PROCESSING +
        retData["fileName"] +
        "_" +
        new Date().getTime() +
        ".pdf";
      urlToSendBack =
        "downloads/" +
        retData["fileName"] +
        "_" +
        new Date().getTime() +
        ".pdf";

      let htmlData;
      if (body["reportType"] == "detail_report") {
        htmlData = htmlForReport;
      }
      if (body["reportType"] == "summary_report") {
        htmlData = htmlForReportSummary;
      }
      if (
        body["reportType"] == "" ||
        body["reportType"] == undefined ||
        body["reportType"] == null
      ) {
        htmlData = htmlForReport;
      }

      inlineCSS.inlineHtml(htmlData, function (userinlineHtml) {
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
                message: "Not able to create PDF",
              });
            } else {
              console.log("Response", response);
              return res.json({
                success: true,
                data: { url: urlToSendBack },
                message: "URL for the PDF file",
              });
            }
          });
      });
    } else {
      return { success: false, message: "No data found", status: 200 };
    }
  } catch (err) {
    console.log("Error while saving reports filter", err);
    return res.json({ succes: false, data: "", message: err });
  }
};

// Download call report by extension in PDF format functionality
exports.downdloadCallReportPDFByExt = async (req, res) => {
  try {
    let body = req.body;
    let params = req.params;
    let retData;

    if (
      params &&
      params["orgId"] &&
      body["startDate"] &&
      body["endDate"] &&
      body["fileName"]
    ) {
      retData = await toGetReportDataByExt(body, params, false);
    } else {
      return res.json({ success: false, data: "", message: "Missing data" });
    }

    if (retData && retData["query"] && retData["query"].length) {
      htmlForReport = `  <html xmlns="http://www.w3.org/1999/xhtml">
                       <head>
                          <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
                          <title></title>
                          <script defer src="/static/fontawesome/fontawesome-all.js"></script>
                       </head>
                       <body style="padding: 0; margin: 0; background-repeat: repeat; width: 100% !important; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; -webkit-font-smoothing: antialiased;">
                          <table width="1100" border="0" cellspacing="0" cellpadding="0" align="center" style="background:#fff;font-family: Arial, Helvetica, sans-serif;font-size: 14px;font-style: normal;font-weight: normal;line-height: 22px;word-break: break-word;color: #444;text-align: left;">
                             <tbody>
                                <tr>
                                   <td colspan="6" style="padding: 15px 0 10px;font-size: 22px;font-weight: bold;     text-align: center;">
                                     Extension Based Detailed Report
                                   </td>
                                </tr>
                                <tr>
                                   <td style="padding: 25px 0 10px;font-size: 16px;font-weight: bold;">
                                      Date :
                                      <span style="font-weight: normal;padding-left: 5px;">
                                      ${retData.DateFrom} - ${retData.DateTo}
                                      </span>
                                   </td>               
                                </tr>
                             </tbody>
                          </table>
                          <table width="1100" border="0" cellspacing="0" cellpadding="0" align="center" style="background:#fff;font-family: Arial, Helvetica, sans-serif;font-size: 14px;font-style: normal;font-weight: normal;line-height: 22px;word-break: break-word;color: #333;text-align: center;   border: 1px solid #999;   border-collapse: collapse;">
                             <tbody>
                                <tr style="background:#ddd;">
                                   <td style="padding:10px 5px;border: 1px solid #999;border-collapse: collapse;">
                                      Extension
                                   </td>
                                   <td style="padding:10px 5px;border: 1px solid #999; border-collapse: collapse;">
                                      Username
                                   </td>
                                   <td style="padding:10px 5px;border: 1px solid #999;border-collapse: collapse;">
                                      Duration
                                   </td>
                                   <td style="padding:10px 5px;border: 1px solid #999; border-collapse: collapse;">
                                      Incoming Calls
                                   </td>
                                   <td style="padding:10px 5px;border: 1px solid #999;border-collapse: collapse;">
                                      Outgoing Calls
                                   </td>
                                   <td style="padding:10px 5px;border: 1px solid #999;border-collapse: collapse;">
                                      Missed Calls
                                   </td>
                                   <td style="padding:10px 5px;border: 1px solid #999;border-collapse: collapse;">
                                      Total Calls
                                   </td>
                                   <td style="padding:10px 5px;border: 1px solid #999;border-collapse: collapse;">
                                      Total Amount
                                   </td>
                                   
                                  
                                </tr>`;

      for (let index = 0; index < retData.query.length; index++) {
        let singleCall = retData["query"][index];
        let totalCost = singleCall.totalCost || 0;
        totalCost = totalCost.toFixed(2);
        htmlForReport += ` <tr style="background:#fff;" >
                              <td style="padding:10px 5px;">
                                ${singleCall.extension}
                              </td>
                              <td style="padding:10px 5px;">
                                ${singleCall.username}
                              </td>
                              <td style="padding:10px 5px;">
                                ${singleCall.totalDuration}
                              </td>
                              <td style="padding:10px 5px;">
                                ${singleCall.incomingCount}
                              </td>
                              <td style="padding:10px 5px;">
                                ${singleCall.outgoingCount}
                              </td>
                              <td style="padding:10px 5px;">
                                ${singleCall.missedCalls}
                              </td>
                              <td style="padding:10px 5px;text-align:center">
                                ${singleCall.totalCallsMade}
                              </td>
                              <td style="padding:10px 5px;">
                                ${totalCost} 
                              </td>
                              
                          </tr>`;
      }
      let totalAmount = retData.totalAmount.toFixed(2) || 0;

      htmlForReport += `<tr style="background:#fff;border: 0 !important;
      font-weight: bolder !important;"><td style=";border-top: 1px solid #666; border-collapse: collapse; ></td><td style=";border-top: 1px solid #666; border-collapse: collapse; ></td><td style=";border-top: 1px solid #666; border-collapse: collapse; ></td><td style=";border-top: 1px solid #666; border-collapse: collapse; ></td><td style="padding:10px 5px;border-top: 1px solid #666; border-collapse: collapse; text-align:right;">Total</td>
      <td style="padding:10px 5px;border-top: 1px solid #666; border-collapse: collapse; text-align:center;">${retData.totalIncomingCalls}</td>
      <td style="padding:10px 5px;border-top: 1px solid #666; border-collapse: collapse; text-align:center;">${retData.totalOutgoingCalls}</td>
      <td style="padding:10px 5px;border-top: 1px solid #666; border-collapse: collapse; text-align:center;">${retData.totalMissedCalls}</td>
      <td style="padding:10px 5px;border-top: 1px solid #666; border-collapse: collapse; text-align:center;">${retData.totalCalls}</td>
      <td style="padding:10px 5px;border-top: 1px solid #666; border-collapse: collapse; text-align:center;">${totalAmount}</td></tr>
 </tbody> </table>
                          <br/>
                           <table width="1100" border="0" cellspacing="0" cellpadding="0" align="center" style="background:#fff;font-family: Arial, Helvetica, sans-serif;font-size: 14px;font-style: normal;font-weight: normal;line-height: 22px;word-break: break-word;color: #333;text-align: left;    border-top: 1px solid #666;">
                             <tbody>
                                <tr>
                                  
                                   <td style="padding: 25px 0 10px;font-size: 16px;font-weight: bold;">
                                    Printed On :
                                    <span style="font-weight: normal;padding-left: 5px;">
                                    ${retData.Today}
                                    </span>
                                 </td>
                                </tr>
                                
                             </tbody>
                          </table> 
                       </body>
                    </html>`;

      var DIR_FOR_PROCESSING = global.globalPath + "/public/downloads/";
      if (!fs.existsSync(DIR_FOR_PROCESSING)) {
        fs.mkdirSync(DIR_FOR_PROCESSING);
      }

      var pdfFileToSave =
        DIR_FOR_PROCESSING +
        "extension_report" +
        "_" +
        new Date().getTime() +
        ".pdf";
      urlToSendBack =
        "downloads/" + "extension_report" + "_" + new Date().getTime() + ".pdf";

      let htmlData = htmlForReport;

      inlineCSS.inlineHtml(htmlData, function (userinlineHtml) {
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
                message: "Not able to create PDF",
              });
            } else {
              console.log("Response", response);
              return res.json({
                success: true,
                data: { url: urlToSendBack },
                message: "URL for the PDF file",
              });
            }
          });
      });
    } else {
      return { success: false, message: "No data found", status: 200 };
    }
  } catch (err) {
    console.log("Error while saving reports filter", err);
    return res.json({ succes: false, data: "", message: err });
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

// Actual Functionality for Calculating Call Reports on the basis of all filters, groups, searh critiera is here
async function toGetReportData(body, params, filterRequired) {
  let startDate = new Date(moment(body["startDate"]).utc(true));
  let endDate = new Date(moment(body["endDate"]).utc(true));
  let populateFields = null;

  let dataToFind = {
    organization: params["orgId"],
    softDelete: false,
    CallTime: { $gte: startDate, $lte: endDate },
  };

  let filterData = { sort: {} };

  // Filter on the basis of extension chosen
  if (body["extension"] && body["extension"].length) {
    let users = await USER.find(
      { organization: params["orgId"], _id: { $in: body["extension"] } },
      "extension"
    );
    let extensions = _.difference(_.pluck(users, "extension"), [
      undefined,
      null,
      "",
    ]);

    dataToFind["$or"] = [
      {
        Callernumber: {
          $in: _.map(extensions, function (singleExtension) {
            return Number(singleExtension);
          }),
        },
      },
      {
        Callednumber: {
          $in: _.map(extensions, function (singleExtension) {
            return String(singleExtension);
          }),
        },
      },
    ];
  }

  // Filter on the basis of Search number
  if (body["searchByNumber"]) {
    dataToFind["$or"] = dataToFind["$or"] || [];
    dataToFind["$or"].push({ Callernumber: Number(body["searchByNumber"]) });
    dataToFind["$or"].push({ Callednumber: body["searchByNumber"] });
    dataToFind["$or"].push({ DialedNumber: body["searchByNumber"] });
  }

  // Filter on the basis of call type chosen
  if (body["callType"] && body["callType"].length) {
    dataToFind["CallType"] = { $in: body["callType"] };
  }

  // Filter on the basis of Direction chosen
  if (body["direction"] && body["direction"].length) {
    dataToFind["Direction"] = { $in: body["direction"] };
  }

  // Filter on the basis of Order By chosen else go by default with Call Time
  if (body["orderBy"]) {
    filterData["sort"][body["orderBy"]] = -1;
    // console.log('check order by find' + body['orderBy'])
  } else {
    filterData["sort"]["CallTime"] = 1;
    // console.log('check order by not find')
  }

  if (body["getCallCosting"] == false) {
    populateFields = "-CalculatedCost";
  }

  // Filter on the basis of Branch chosen
  if (body["branch"] && body["branch"].length) {
    dataToFind["branch"] = { $in: body["branch"] };
  }

  // Filter on the basis of Department chosen
  if (body["department"] && body["department"].length) {
    dataToFind["department"] = { $in: body["department"] };
  }

  if (body["searchData"]) {
    dataToFind["$or"] = [
      { Callernumber: Number(body["searchData"]) },
      { Callednumber: body["searchData"] },
    ];
  }

  console.log("filter data: " + filterData);
  let retDoc, total;
  retDoc = await CALL_LOG.find(dataToFind, populateFields, filterData)
    .populate("branch", "name")
    .populate("department", "name")
    .populate("callerUser", "firstName lastName")
    .populate("calledUser", "firstName lastName")
    .lean();

  if (filterRequired) {
    total = await CALL_LOG.countDocuments(dataToFind);
  }

  // console.log("Query returned: "+retDoc)

  let retJsonDocs = {};

  // Some changes require for the view in the Call reports page
  for (var index in retDoc) {
    retDoc[index]["branchName"] = retDoc[index]["branch"]
      ? retDoc[index]["branch"]["name"]
      : "";
    retDoc[index]["branch"] = retDoc[index]["branch"]
      ? retDoc[index]["branch"]["_id"]
      : "";
    retDoc[index]["departmentName"] = retDoc[index]["department"]
      ? retDoc[index]["department"]["name"]
      : "";
    retDoc[index]["department"] = retDoc[index]["department"]
      ? retDoc[index]["department"]["_id"]
      : "";
    retDoc[index]["CallerName"] = retDoc[index]["callerUser"]
      ? retDoc[index]["callerUser"]["firstName"]
      : "";
    retDoc[index]["CalledName"] = retDoc[index]["calledUser"]
      ? retDoc[index]["calledUser"]["firstName"]
      : "";
  }

  if (retDoc && retDoc.length) {
    if (body["groupBy"]) {
      retJsonDocs = _.groupBy(retDoc, body["groupBy"]);

      let retJsonDocsKeys = Object.keys(retJsonDocs);

      for (var index in retJsonDocsKeys) {
        retJsonDocs[retJsonDocsKeys[index]] =
          retJsonDocs[retJsonDocsKeys[index]];
      }
      retDoc = _.flatten(_.values(retJsonDocs));
    } else {
      // Default group By CallTime
      retJsonDocs = _.groupBy(retDoc, "CallTime");
      retDoc = _.flatten(_.values(retJsonDocs));
    }
  }

  if (filterRequired) {
    retDoc = retDoc.splice(body["skip"], body["limit"]);
  }

  let totalCalls = retDoc.length;
  let totalDuration = 0,
    totalAmount = 0,
    answeredCalls = 0,
    missedCalls = 0;

  // Some Additional Fields
  for (var index in retDoc) {
    let retMsg = secondsToDHMS(retDoc[index]["CallDuration"]);

    if (retMsg != "00:00:00") {
      totalDuration += retDoc[index]["CallDuration"];
      totalAmount += retDoc[index]["CalculatedCost"] || 0;
      answeredCalls++;
      retDoc[index]["CallDuration"] = retMsg;
      retDoc[index]["CallAnswered"] = "Yes";
    } else {
      missedCalls++;
      retDoc[index]["CallDuration"] = "00:00:00";
      retDoc[index]["CallAnswered"] = "No";
    }

    if (retDoc[index]["Direction"] == "I") {
      retDoc[index]["Direction"] = "In";
    } else if (retDoc[index]["Direction"] == "O") {
      retDoc[index]["Direction"] = "Out";
    }

    retDoc[index]["CallTime"] =
      moment(retDoc[index]["CallTime"]).utc().format("L") +
      " " +
      moment(retDoc[index]["CallTime"]).utc().format("LT");
  }

  return {
    success: true,
    query: retDoc,
    DateFrom:
      moment(startDate).utc().format("L") +
      " " +
      moment(startDate).utc().format("LT"),
    DateTo:
      moment(endDate).utc().format("L") +
      " " +
      moment(endDate).utc().format("LT"),
    Today: moment().format("L") + " " + moment().format("LT"),
    TotalCalls: totalCalls,
    TotalSeconds: totalDuration,
    TotalDuration: secondsToDHMS(totalDuration),
    TotalAmount: totalAmount.toFixed(2),
    AnsweredCalls: answeredCalls,
    MissedCalls: missedCalls,
    fileName: body["fileName"],
    total: total,
  };
}

async function toGetReportDataByExt(body, params, filterRequired) {
  let startDate = new Date(moment(body["startDate"]).utc(true));
  let endDate = new Date(moment(body["endDate"]).utc(true));
  let populateFields = null;

  let dataToFind = {
    organization: params["orgId"],
    softDelete: false,
    CallTime: { $gte: startDate, $lte: endDate },
  };

  let filterData = { sort: {} };

  // Filter on the basis of extension chosen
  if (body["extension"] && body["extension"].length) {
    let users = await USER.find(
      { organization: params["orgId"], _id: { $in: body["extension"] } },
      "extension"
    );
    let extensions = _.difference(_.pluck(users, "extension"), [
      undefined,
      null,
      "",
    ]);

    dataToFind["$or"] = [
      {
        Callernumber: {
          $in: _.map(extensions, function (singleExtension) {
            return Number(singleExtension);
          }),
        },
      },
      {
        Callednumber: {
          $in: _.map(extensions, function (singleExtension) {
            return String(singleExtension);
          }),
        },
      },
    ];
  }

  // Filter on the basis of Search number
  if (body["searchByNumber"]) {
    dataToFind["$or"] = dataToFind["$or"] || [];
    dataToFind["$or"].push({ Callernumber: Number(body["searchByNumber"]) });
    dataToFind["$or"].push({ Callednumber: body["searchByNumber"] });
    dataToFind["$or"].push({ DialedNumber: body["searchByNumber"] });
  }

  // Filter on the basis of call type chosen
  if (body["callType"] && body["callType"].length) {
    dataToFind["CallType"] = { $in: body["callType"] };
  }

  // Filter on the basis of Direction chosen
  if (body["direction"] && body["direction"].length) {
    dataToFind["Direction"] = { $in: body["direction"] };
  }

  // Filter on the basis of Order By chosen else go by default with Call Time
  if (body["orderBy"]) {
    filterData["sort"][body["orderBy"]] = -1;
    // console.log('check order by find' + body['orderBy'])
  } else {
    filterData["sort"]["CallTime"] = 1;
    // console.log('check order by not find')
  }

  if (body["getCallCosting"] == false) {
    populateFields = "-CalculatedCost";
  }

  // Filter on the basis of Branch chosen
  if (body["branch"] && body["branch"].length) {
    dataToFind["branch"] = { $in: body["branch"] };
  }

  // Filter on the basis of Department chosen
  if (body["department"] && body["department"].length) {
    dataToFind["department"] = { $in: body["department"] };
  }

  if (body["searchData"]) {
    dataToFind["$or"] = [
      { Callernumber: Number(body["searchData"]) },
      { Callednumber: body["searchData"] },
    ];
  }

  console.log("filter data: " + filterData);
  let retDoc, total;
  retDoc = await CALL_LOG.find(dataToFind, populateFields, filterData)
    .populate("branch", "name")
    .populate("department", "name")
    .populate("callerUser", "firstName lastName")
    .populate("calledUser", "firstName lastName")
    .lean();

  if (filterRequired) {
    total = await CALL_LOG.countDocuments();
  }

  // console.log("Query returned: "+retDoc)

  let retJsonDocs = {};

  // Some changes require for the view in the Call reports page
  for (var index in retDoc) {
    retDoc[index]["branchName"] = retDoc[index]["branch"]
      ? retDoc[index]["branch"]["name"]
      : "";
    retDoc[index]["branch"] = retDoc[index]["branch"]
      ? retDoc[index]["branch"]["_id"]
      : "";
    retDoc[index]["departmentName"] = retDoc[index]["department"]
      ? retDoc[index]["department"]["name"]
      : "";
    retDoc[index]["department"] = retDoc[index]["department"]
      ? retDoc[index]["department"]["_id"]
      : "";
    retDoc[index]["CallerName"] = retDoc[index]["callerUser"]
      ? retDoc[index]["callerUser"]["firstName"]
      : "";
    retDoc[index]["CalledName"] = retDoc[index]["calledUser"]
      ? retDoc[index]["calledUser"]["firstName"]
      : "";
  }

  if (retDoc && retDoc.length) {
    if (body["groupBy"]) {
      retJsonDocs = _.groupBy(retDoc, body["groupBy"]);

      let retJsonDocsKeys = Object.keys(retJsonDocs);

      for (var index in retJsonDocsKeys) {
        retJsonDocs[retJsonDocsKeys[index]] =
          retJsonDocs[retJsonDocsKeys[index]];
      }
      retDoc = _.flatten(_.values(retJsonDocs));
    } else {
      // Default group By CallTime
      retJsonDocs = _.groupBy(retDoc, "CallTime");
      retDoc = _.flatten(_.values(retJsonDocs));
    }
  }

  if (filterRequired) {
    retDoc = retDoc.splice(body["skip"], body["limit"]);
  }

  let totalCalls = retDoc.length;
  let totalDuration = 0,
    totalAmount = 0,
    answeredCalls = 0,
    missedCalls = 0;

  let arrForExt = [];

  let arrDur = [];

  // Some Additional Fields
  for (var index in retDoc) {
    let retMsg = secondsToDHMS(retDoc[index]["CallDuration"]);

    if (retMsg != "00:00:00") {
      totalDuration += retDoc[index]["CallDuration"];
      totalAmount += retDoc[index]["CalculatedCost"] || 0;
      answeredCalls++;
      retDoc[index]["CallDuration"] = retMsg;
      // retDoc[index]["Duration"] =
      retDoc[index]["CallAnswered"] = "Yes";
    } else {
      missedCalls++;
      retDoc[index]["CallDuration"] = "00:00:00";
      retDoc[index]["CallAnswered"] = "No";
    }

    if (retDoc[index]["Direction"] == "I") {
      retDoc[index]["Direction"] = "In";
      arrForExt.push(retDoc[index]["Callednumber"]);
      arrDur.push(retDoc[index]["CallDuration"]);
    } else if (retDoc[index]["Direction"] == "O") {
      arrForExt.push(retDoc[index]["Callernumber"]);
      retDoc[index]["Direction"] = "Out";
      arrDur.push(retDoc[index]["CallDuration"]);
    }

    retDoc[index]["CallTime"] =
      moment(retDoc[index]["CallTime"]).utc().format("L") +
      " " +
      moment(retDoc[index]["CallTime"]).utc().format("LT");
  }

  // find users
  let usersFind = await USER.find(
    { organization: params["orgId"], softDelete: false },
    "extension firstName lastName"
  ).populate("role", "name");

  let resUsers = [];
  let retrExt = [];
  usersFind.forEach(async (element) => {
    if (
      (element["extension"] != null || element["extension"] != undefined) &&
      (element["role"]["name"] == "user" ||
        element["role"]["name"] == "User" ||
        element["role"]["name"] == "admin" ||
        element["role"]["name"] == "Admin" ||
        element["role"]["name"] == "users" ||
        element["role"]["name"] == "Users" ||
        element["role"]["name"] == "admins" ||
        element["role"]["name"] == "Admins")
    ) {
      resUsers.push(element);

      retrExt.push({
        _id: element["extension"],
        extension: element["extension"],
        username: element["firstName"] + " " + element["lastName"],
      });
    }
  });

  const expenededMap = resUsers.reduce((map, obj) => {
    if (obj.expended) map.set(obj.extension, obj);
    return map;
  }, new Map());

  arr1 = retDoc.map((obj) => {
    if (obj.expended) return obj;
    const objFromArr2 = expenededMap.get(obj.id) || {};
    return objFromArr2.expended ? objFromArr2 : obj;
  });

  let countArr = [];
  let userExtensions = [];
  for (var d in retrExt) {
    userExtensions.push(retrExt[d]["extension"]);

    let allData = await CALL_LOG.find({
      organization: mongoose.Types.ObjectId(params["orgId"]),
      Direction: "O",
      Callernumber: retrExt[d]["extension"],
      CallTime: { $gte: startDate, $lte: endDate },
      softDelete: false,
    }).count();

    let allDataIn = await CALL_LOG.find({
      organization: mongoose.Types.ObjectId(params["orgId"]),
      Direction: "I",
      Callednumber: retrExt[d]["extension"],
      CallTime: { $gte: startDate, $lte: endDate },
      softDelete: false,
    }).count();

    let missedRecords = await CALL_LOG.find({
      organization: mongoose.Types.ObjectId(params["orgId"]),
      CallDuration: { $eq: 0 },
      Callednumber: retrExt[d]["extension"],
      CallTime: { $gte: startDate, $lte: endDate },
      softDelete: false,
    }).count();

    countArr.push({
      outgoingCount: allData,
      incomingCount: allDataIn,
      missedCalls: missedRecords,
      extension: retrExt[d]["extension"],
      _id: retrExt[d]["extension"],
      totalCallsMade: allData + allDataIn,
    });
  }

  let aggregateQuery = [
    {
      $match: {
        organization: mongoose.Types.ObjectId(params["orgId"]),
        Direction: "O",
        softDelete: false,
        CallTime: { $gte: startDate, $lte: endDate },
      },
    },
    { $unwind: "$Callernumber" },
    {
      $group: {
        _id: "$Callernumber",
        totalDurationOutgoing: { $sum: "$CallDuration" },
        totalCost: { $sum: "$CalculatedCost" },
      },
    },
  ];

  let retDocsOutgoing = await CALL_LOG.aggregate(aggregateQuery);

  let aggregateQueryIn = [
    {
      $match: {
        organization: mongoose.Types.ObjectId(params["orgId"]),
        Direction: "I",
        softDelete: false,
        CallTime: { $gte: startDate, $lte: endDate },
      },
    },
    { $unwind: "$Callednumber" },
    {
      $group: {
        _id: "$Callednumber",
        totalDurationIncoming: { $sum: "$CallDuration" },
      },
    },
  ];

  let retDocsIncoming = await CALL_LOG.aggregate(aggregateQueryIn);

  const mergeArr = (arr1, arr2) => {
    const obj = {};

    arr1.forEach((item) => {
      obj[item._id] = item;
    });

    arr2.forEach((item) => {
      obj[item._id]
        ? (obj[item._id] = { ...obj[item._id], ...item })
        : (obj[item._id] = item);
    });

    return Object.values(obj);
  };

  let output = mergeArr(retDocsOutgoing, retDocsIncoming);

  let outputNew = mergeArr(output, retrExt);

  let resultOutput = mergeArr(outputNew, countArr);

  let totalIncomingCalls = 0,
    totalOutgoingCalls = 0,
    totalMissedCalls = 0,
    totalCallCount = 0,
    totalAmounts = 0;

  resultOutput.forEach((element) => {
    element["totalDurationOutgoing"] = secondsToDHMS(
      element["totalDurationOutgoing"]
    );
    element["totalDurationIncoming"] = secondsToDHMS(
      element["totalDurationIncoming"]
    );
    element["totalDuration"] =
      element["totalDurationIncoming"] + "," + element["totalDurationOutgoing"];

    element["totalDuration"] = addTimes(element["totalDuration"]);

    console.log(element["totalCost"], 'element["totalCost"]');

    totalIncomingCalls += element["incomingCount"] || 0;
    totalOutgoingCalls += element["outgoingCount"] || 0;
    totalMissedCalls += element["missedCalls"] || 0;
    totalCallCount += element["totalCallsMade"] || 0;
    totalAmounts += element["totalCost"] || 0;
  });

  return {
    success: true,
    query: resultOutput,
    total: resultOutput.length,
    totalIncomingCalls: totalIncomingCalls,
    totalOutgoingCalls: totalOutgoingCalls,
    totalMissedCalls: totalMissedCalls,
    totalCalls: totalCallCount,
    totalAmount: totalAmounts,
    usersExt: userExtensions,
    DateFrom:
      moment(startDate).utc().format("L") +
      " " +
      moment(startDate).utc().format("LT"),
    DateTo:
      moment(endDate).utc().format("L") +
      " " +
      moment(endDate).utc().format("LT"),
    Today: moment().format("L") + " " + moment().format("LT"),
  };
}

// Add two times in hh:mm:ss format
function addTimes(time) {
  let times = time.split(",");
  // console.log(times);
  const z = (n) => (n < 10 ? "0" : "") + n;

  let hour = 0;
  let minute = 0;
  let second = 0;
  for (const time of times) {
    const splited = time.split(":");
    hour += parseInt(splited[0]);
    minute += parseInt(splited[1]);
    second += parseInt(splited[2]);
  }
  const seconds = second % 60;
  const minutes = parseInt(minute % 60) + parseInt(second / 60);
  const hours = hour + parseInt(minute / 60);

  return z(hours) + ":" + z(minutes) + ":" + z(seconds);
}
