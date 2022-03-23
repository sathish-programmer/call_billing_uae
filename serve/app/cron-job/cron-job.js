var CronJob = require("cron").CronJob;
const CALL_LOGS = require("../call-logs/call-logs.model");
const _ = require("underscore");
const TARIFF_DETAILS = require("../tariff/tariff.model");
const USER = require("../user/user.model");

// Calculate Call Type for the Call log
var calculateCallType = new CronJob("*/1 * * * *", async function () {
  console.log("Job triggered for calcualting call type");
  var callLogs = await CALL_LOGS.find({ callTypeCalculated: false }, "", {
    limit: 5000,
    sort: { creationDate: -1 },
  }).lean();
  if (callLogs && callLogs.length) {
    // console.log('loading started')
    let organizations = _.pluck(callLogs, "organization");
    let shallFetchTariffDetails = true;
    let tariffDetails = [];
    for (var callLogIndex in callLogs) {
      let singleCallLog = callLogs[callLogIndex] || {};
      let type = [];

      // VOICE MAIL
      if (
        (singleCallLog["Party2Device"] &&
          singleCallLog["Party2Device"] == "VM") ||
        (singleCallLog["Party2Device"] &&
          singleCallLog["Party2Device"].indexOf("V95") == 0) ||
        (singleCallLog["ExternalTargetingCause"] &&
          singleCallLog["ExternalTargetingCause"].indexOf("VM Channel") == 0)
      ) {
        type.push("voicemail");
      }

      // CONFERENCE CALL
      if (
        singleCallLog["Party2Name"] &&
        singleCallLog["Party2Name"].indexOf("CO Channel") == 0
      ) {
        type.push("conference");
      }

      if (
        (singleCallLog["ExternalTargetingCause"] &&
          singleCallLog["ExternalTargetingCause"].indexOf("CfP") > 0) ||
        (singleCallLog["ExternalTargetingCause"] &&
          singleCallLog["ExternalTargetingCause"].indexOf("Cfd") > 0) ||
        (singleCallLog["Direction"] && singleCallLog["Direction"] == "C")
      ) {
        type.push("conference");
      }

      // TRANSFER CALL
      if (
        (singleCallLog["ExternalTargetName"] &&
          singleCallLog["ExternalTargetName"].indexOf("U") !== -1) ||
        (singleCallLog["ExternalTargetName"] &&
          singleCallLog["ExternalTargetName"].indexOf("U Xfd") !== -1) ||
        (singleCallLog["ExternalTargetName"] &&
          singleCallLog["ExternalTargetName"].indexOf("Xfd") !== -1)
      ) {
        type.push("transfer");
      }

      // MISSED call incomming
      if (
        singleCallLog["Direction"] &&
        singleCallLog["Direction"] == "I" &&
        singleCallLog["CallDuration"] == 0
      ) {
        type.push("missed");
      }

      // MISSED call outgoing
      if (
        singleCallLog["Direction"] &&
        singleCallLog["Direction"] == "O" &&
        singleCallLog["CallDuration"] == 0
      ) {
        type.push("missed");
      }

      //Internal call
      if (
        singleCallLog["IsInternal"] &&
        singleCallLog["IsInternal"] == "1" &&
        singleCallLog["Direction"] &&
        singleCallLog["Direction"] == "O" &&
        singleCallLog["Callernumber"] &&
        String(singleCallLog["Callernumber"]).length >= 3 &&
        String(singleCallLog["Callernumber"]).length <= 6 &&
        singleCallLog["Callednumber"] &&
        singleCallLog["Callednumber"].length >= 3 &&
        singleCallLog["Callednumber"].length <= 6
      ) {
        type.push("internal");
      }

      // service
      let code_service = singleCallLog["Callednumber"].substring(0, 6);
      if (
        (code_service + "").indexOf("1800") > -1 &&
        singleCallLog["Direction"] == "O"
      ) {
        console.log("outgoing service");
        type.push("service");
      }
      let code_service_incoming = String(
        singleCallLog["Callernumber"]
      ).substring(0, 6);
      if (
        (code_service_incoming + "").indexOf("1800") > -1 &&
        singleCallLog["Direction"] == "I"
      ) {
        console.log("incoming service");
        type.push("service");
      }

      // mobile bangalore call
      if (
        (singleCallLog["Callednumber"] &&
          singleCallLog["Callednumber"].indexOf("80") == 0 &&
          singleCallLog["Direction"] == "O" &&
          singleCallLog["Callednumber"].length == 12) ||
        (singleCallLog["Callednumber"] &&
          singleCallLog["Callednumber"].indexOf("0") == 0 &&
          singleCallLog["Direction"] == "O" &&
          singleCallLog["Callednumber"].length == 11) ||
        (singleCallLog["Callernumber"] &&
          singleCallLog["Direction"] == "I" &&
          String(singleCallLog["Callernumber"]).length == 10)
      ) {
        type.push("mobile");
      }

      // Local call
      // if((singleCallLog["Callednumber"] &&
      // singleCallLog["Callednumber"].indexOf("800") == 0 && singleCallLog["Callednumber"].length > 12) || (singleCallLog["Callednumber"] &&
      // singleCallLog["Callednumber"].indexOf("00") == 0 && singleCallLog["Callednumber"].length >= 12)){
      //   type.push('local');
      // }

      {
        let lookInto = "";

        // Check if we have fetched the tariff detail because few call types
        // are linked with the tariff.
        // If not then fetch it first
        if (shallFetchTariffDetails) {
          tariffDetails = await fetchTariffDetails(organizations);
          shallFetchTariffDetails = false;
        }

        // Which number we have to choose
        if (singleCallLog["Direction"] == "I") {
          lookInto = "Callernumber";
        } else {
          lookInto = "Callednumber";
        }

        singleCallLog[lookInto] = String(singleCallLog[lookInto]);

        // if (singleCallLog[lookInto] && singleCallLog[lookInto].length == 11) {
        //   singleCallLog[lookInto] = singleCallLog[lookInto].substring(1, singleCallLog[lookInto].length);
        // }

        // Find tariff as per the organization of the call log
        let tariffsPerOrg = _.difference(
          tariffDetails.filter((td) => {
            if (
              String(td.organization) ==
                String(singleCallLog["organization"]) &&
              String(td.branch) == String(singleCallLog["branch"])
            ) {
              return td;
            }
          }),
          [undefined, null, ""]
        );

        let tarrifFileCode = singleCallLog[lookInto];
        let splitLookinto = tarrifFileCode.substring(0, 3);
        let splitLookinto_intern = tarrifFileCode.substring(0, 2);
        // let code_service_chk = tarrifFileCode.includes("1800");
        let substring = "1800";
        let code_service_chk = tarrifFileCode.indexOf(substring) !== -1;
        if (singleCallLog["IsInternal"] != "1" && !code_service_chk) {
          if (
            (singleCallLog[lookInto] && splitLookinto == "800") ||
            (singleCallLog[lookInto] &&
              splitLookinto_intern == "00" &&
              tarrifFileCode.length < 13)
          ) {
            type.push("local");
          } else if (
            singleCallLog[lookInto] &&
            splitLookinto_intern == "00" &&
            tarrifFileCode.length > 13
          ) {
            type.push("international");
          } else {
            type.push("mobile");
          }
        }

        // Filter all tariff where the country code matches with the number
        // let retDoc = tariffsPerOrg.filter((stpo) => {
        // if (
        //   singleCallLog[lookInto] &&
        //   singleCallLog[lookInto].indexOf(stpo.countryCode) == 0
        // ) {
        //   console.log("checkkk ccode founded " + stpo.countryCode);
        //   console.log("return checkingg " + stpo);
        //   return stpo;
        // }
        // });

        // put all matched record's call type and assign it as the call type for the particular log
        // if (retDoc && retDoc.length) {
        //   let allTypes = _.difference(_.pluck(retDoc, "callType"), [
        //     undefined,
        //     null,
        //     "",
        //   ]);
        //   type = [...type, ...allTypes];
        // }
      }

      console.log("sathish types" + type);

      if (type && type.length) {
        type = type.map((sT) => {
          return sT.toLowerCase();
        });

        await CALL_LOGS.update(
          { _id: callLogs[callLogIndex]["_id"] },
          { $set: { CallType: type, callTypeCalculated: true } }
        );
      }
    }
  }
});

calculateCallType.start();

// Calculate Call cost for the Call Logs
var calculateCallCostJob = new CronJob("*/1 * * * *", async function () {
  let callLogs = await CALL_LOGS.find(
    { callCostCalculated: false, Direction: "O" },
    "Callednumber CallDuration _id organization branch",
    { limit: 5000, sort: { creationDate: -1 } }
  );
  if (callLogs && callLogs.length) {
    let organizations = _.pluck(callLogs, "organization");
    let tariffDetails = await fetchTariffDetails(organizations);

    for (let index in callLogs) {
      let singleCallLog = callLogs[index] || {};
      console.log("single call log " + singleCallLog);
      let tariffsPerOrg = _.difference(
        tariffDetails.filter((td) => {
          if (
            String(td.organization) == String(singleCallLog["organization"]) &&
            String(td.branch) == String(singleCallLog["branch"])
          ) {
            console.log("check code in file " + String(td.code));
            return td;
          }
        }),
        [undefined, null, ""]
      );

      let oneCycle = 60,
        cost = 0,
        totalCycles = 0;

      if (
        callLogs[index]["Callednumber"] &&
        tariffsPerOrg &&
        tariffsPerOrg.length
      ) {
        let number = callLogs[index]["Callednumber"];
        let code, costCycleJson;
        let CallednumberLength = number.length;

        console.log("printed coming");
        // INTERNATIONAL
        if (CallednumberLength == 14) {
          code = number.substring(0, 2);
          console.log("login international");
          if (code == "00") {
            console.log("checked international" + code);
            costCycleJson = _.findWhere(tariffsPerOrg, { countryCode: code });
          }
        }
        // MOBILE
        else if (CallednumberLength == 11 || CallednumberLength == 12) {
          code = number.substring(0, number.length % 10);
          if (code == "0") {
            console.log("checked mobile" + code);
            costCycleJson = _.findWhere(tariffsPerOrg, { countryCode: code });
          } else if (code == "80") {
            console.log("checked mobile" + code);
            costCycleJson = _.findWhere(tariffsPerOrg, { countryCode: code });
          }
        }
        // LOCAl
        if (CallednumberLength >= 12) {
          code = number.substring(0, number.length % 9);
          if (code == "8004" || code == "8003") {
            console.log("checked local" + code);
            costCycleJson = _.findWhere(tariffsPerOrg, {
              countryCode: code,
            });
          }
        }

        if (costCycleJson) {
          cost = parseFloat(costCycleJson["rate"]);
          console.log("cost " + cost);
          oneCycle =
            parseInt(costCycleJson["units"]) *
            parseInt(costCycleJson["unitsMeasurement"]);
          console.log("one cycle " + oneCycle);
        }

        if (callLogs[index]["CallDuration"]) {
          totalCycles = Math.ceil(callLogs[index]["CallDuration"] / oneCycle);

          console.log("total call cyce = " + totalCycles);
        }

        await CALL_LOGS.findByIdAndUpdate(
          { _id: callLogs[index]["_id"] },
          {
            $set: {
              CalculatedCost: parseFloat((cost * totalCycles).toFixed(2)),
              callCostCalculated: true,
              TotalCycles: totalCycles,
              CostPerCycle: cost,
            },
          }
        );
      }
    }
  }
});

calculateCallCostJob.start();

// Find org Name for the Call log
var findOrgInfoForCallLog = new CronJob("*/05 * * * * *", async function () {
  let callLogs = await CALL_LOGS.find(
    { organizationCalculated: false },
    "Callernumber organization Callednumber DialedNumber _id Direction",
    { limit: 5000, sort: { creationDate: -1 } }
  ).lean();

  try {
    if (callLogs && callLogs.length) {
      let groupedCallLogs = _.groupBy(callLogs, "organization");
      let keys = Object.keys(groupedCallLogs);
      for (let kI in keys) {
        callLogs = groupedCallLogs[keys[kI]];
        let extensions = [];
        // Get Exensions from the call logs
        {
          extensions = _.union(
            _.pluck(callLogs, "Callernumber"),
            _.pluck(callLogs, "Callednumber"),
            _.pluck(callLogs, "DialedNumber")
          );
          extensions = _.uniq(
            _.difference(
              _.map(extensions, function (se) {
                se = String(se);

                if (se.length <= 6 && !isNaN(parseInt(se))) {
                  return se;
                } else {
                  return null;
                }
              }),
              [undefined, null, ""]
            )
          );
        }

        // Get User extensions
        let userDetails = await USER.find(
          {
            softDelete: false,
            extension: { $in: extensions },
          },
          "organization extension",
          { limit: 1, sort: { _id: -1 } }
        ).lean();

        // Tie org with call log
        {
          let updateData;
          for (let index in callLogs) {
            updateData = {};
            let number,
              foundOrgDetail = {};
            if (callLogs[index]["Direction"] == "I") {
              number = String(callLogs[index]["Callednumber"]);
              let number1 = String(callLogs[index]["Callernumber"]);
              if (number1.length >= 6) {
                foundOrgDetail = _.findWhere(userDetails, {
                  extension: parseInt(number),
                });
                if (foundOrgDetail) {
                  updateData = {
                    organization: foundOrgDetail["organization"],
                    organizationCalculated: true,
                  };
                }
              }

              if (number.length <= 6) {
                foundOrgDetail = _.findWhere(userDetails, {
                  extension: parseInt(number),
                });
                if (foundOrgDetail) {
                  updateData = {
                    organization: foundOrgDetail["organization"],
                    organizationCalculated: true,
                  };
                }
              }
              if (!updateData["organization"]) {
                number = String(callLogs[index]["Dialednumber"]);
                if (number.length <= 6) {
                  foundOrgDetail = _.findWhere(userDetails, {
                    extension: parseInt(number),
                  });

                  if (foundOrgDetail) {
                    updateData = {
                      organization: foundOrgDetail["organization"],
                      organizationCalculated: true,
                    };
                  }
                }
              }
            } else if (callLogs[index]["Direction"] == "O") {
              number = String(callLogs[index]["Callernumber"]);
              let number1 = String(callLogs[index]["Callednumber"]);
              if (number1.length <= 6) {
                foundOrgDetail = _.findWhere(userDetails, {
                  extension: parseInt(number1),
                });
                if (foundOrgDetail) {
                  updateData = {
                    organization: foundOrgDetail["organization"],
                    organizationCalculated: true,
                  };
                }
              }
              if (number.length <= 6) {
                foundOrgDetail = _.findWhere(userDetails, {
                  extension: parseInt(number),
                });
                if (foundOrgDetail) {
                  updateData = {
                    organization: foundOrgDetail["organization"],
                    organizationCalculated: true,
                  };
                }
              }
            }
            //Updating org with the call log
            if (updateData && Object.keys(updateData).length) {
              await CALL_LOGS.findByIdAndUpdate(
                { _id: callLogs[index]["_id"] },
                { $set: updateData }
              );
            }
            number = foundOrgDetail = null;
          }
        }
      }
      callLogs = keys = groupedCallLogs = null;
    }
  } catch (err) {
    console.log("Error in figuring organization", err);
  }
});

findOrgInfoForCallLog.start();

// Find Branch Name for the Call log
var findBranchInfoForCallLog = new CronJob("*/1 * * * *", async function () {
  console.log("Job triggered for finding branch details for call log");
  let callLogs = await CALL_LOGS.find(
    { branchCalculated: false },
    "Callernumber Callednumber organization DialedNumber _id Direction",
    { limit: 5000, sort: { creationDate: -1 } }
  ).lean();
  try {
    if (callLogs && callLogs.length) {
      let groupedCallLogs = _.groupBy(callLogs, "organization");
      let keys = Object.keys(groupedCallLogs);
      for (let kI in keys) {
        callLogs = groupedCallLogs[keys[kI]];
        let extensions = [];
        // Get Exensions from the call logs
        {
          extensions = _.union(
            _.pluck(callLogs, "Callernumber"),
            _.pluck(callLogs, "Callednumber"),
            _.pluck(callLogs, "DialedNumber")
          );
          extensions = _.uniq(
            _.difference(
              _.map(extensions, function (se) {
                se = String(se);

                if (se.length <= 6 && !isNaN(parseInt(se))) {
                  return se;
                } else {
                  return null;
                }
              }),
              [undefined, null, ""]
            )
          );
        }
        console.log("find branch name");
        // Get User extensions
        let userDetails = await USER.find(
          {
            softDelete: false,
            extension: { $in: extensions },
            // organization: keys[kI],
          },
          "branch extension"
        ).lean();
        // Tie branch with call log
        {
          let updateData;
          for (let index in callLogs) {
            updateData = {};
            let number,
              foundBranchDetail = {};
            if (callLogs[index]["Direction"] == "I") {
              number = String(callLogs[index]["Callednumber"]);
              if (number.length <= 6) {
                foundBranchDetail = _.findWhere(userDetails, {
                  extension: parseInt(number),
                });
                if (foundBranchDetail && foundBranchDetail["branch"] != "all") {
                  updateData = {
                    branch: foundBranchDetail["branch"],
                    branchCalculated: true,
                  };
                }
              }
              if (!updateData["branch"]) {
                number = String(callLogs[index]["Dialednumber"]);
                if (number.length <= 6) {
                  console.log("sathishhh");
                  foundBranchDetail = _.findWhere(userDetails, {
                    extension: parseInt(number),
                  });
                  if (
                    foundBranchDetail &&
                    foundBranchDetail["branch"] != "all"
                  ) {
                    updateData = {
                      branch: foundBranchDetail["branch"],
                      branchCalculated: true,
                    };
                  }
                }
              }
            } else if (callLogs[index]["Direction"] == "O") {
              number = String(callLogs[index]["Callernumber"]);
              if (number.length <= 6) {
                foundBranchDetail = _.findWhere(userDetails, {
                  extension: parseInt(number),
                });
                if (foundBranchDetail && foundBranchDetail["branch"] != "all") {
                  updateData = {
                    branch: foundBranchDetail["branch"],
                    branchCalculated: true,
                  };
                }
              }
            }
            //Updating the call log with branch
            console.log("update data", updateData);
            if (updateData && Object.keys(updateData).length) {
              await CALL_LOGS.findByIdAndUpdate(
                { _id: callLogs[index]["_id"] },
                { $set: updateData }
              );
            }
            number = foundBranchDetail = null;
          }
        }
      }
      callLogs = keys = groupedCallLogs = null;
    }
  } catch (err) {
    console.log("Error in figuring branch name", err);
  }
});

findBranchInfoForCallLog.start();

// Find Department Name for the Call log
var findDepartmentInfoForCallLog = new CronJob(
  "*/1 * * * *",
  async function () {
    console.log("Job triggered for finding department call log");
    let callLogs = await CALL_LOGS.find(
      { departmentCalculated: false },
      "Callernumber Callednumber organization DialedNumber _id Direction",
      { limit: 5000, sort: { creationDate: -1 } }
    ).lean();
    try {
      if (callLogs && callLogs.length) {
        let groupedCallLogs = _.groupBy(callLogs, "organization");
        let keys = Object.keys(groupedCallLogs);
        for (let kI in keys) {
          callLogs = groupedCallLogs[keys[kI]];
          let extensions = [];
          // Get Exensions from the call logs
          {
            extensions = _.union(
              _.pluck(callLogs, "Callernumber"),
              _.pluck(callLogs, "Callednumber"),
              _.pluck(callLogs, "DialedNumber")
            );
            extensions = _.uniq(
              _.difference(
                _.map(extensions, function (se) {
                  se = String(se);

                  if (se.length <= 6 && !isNaN(parseInt(se))) {
                    return se;
                  } else {
                    return null;
                  }
                }),
                [undefined, null, ""]
              )
            );
          }
          console.log("find dept name");
          // Get User extensions
          let userDetails = await USER.find(
            {
              softDelete: false,
              extension: { $in: extensions },
              // organization: keys[kI],
            },
            "department extension"
          ).lean();
          // Tie department with call log
          {
            let updateData;
            for (let index in callLogs) {
              updateData = {};
              let number,
                foundDepartmentDetail = {};
              if (callLogs[index]["Direction"] == "I") {
                number = String(callLogs[index]["Callednumber"]);

                if (number.length <= 6) {
                  foundDepartmentDetail = _.findWhere(userDetails, {
                    extension: parseInt(number),
                  });

                  // console.log('update department '+foundDepartmentDetail)
                  if (
                    foundDepartmentDetail &&
                    foundDepartmentDetail["department"] != "all"
                  ) {
                    updateData = {
                      department: foundDepartmentDetail["department"],
                      departmentCalculated: true,
                    };
                  }
                }

                if (!updateData["department"]) {
                  number = String(callLogs[index]["Dialednumber"]);
                  if (number.length <= 6) {
                    foundDepartmentDetail = _.findWhere(userDetails, {
                      extension: parseInt(number),
                    });

                    if (
                      foundDepartmentDetail &&
                      foundDepartmentDetail["department"] != "all"
                    ) {
                      updateData = {
                        department: foundDepartmentDetail["department"],
                        departmentCalculated: true,
                      };
                    }
                  }
                }
              } else if (callLogs[index]["Direction"] == "O") {
                number = String(callLogs[index]["Callernumber"]);
                // console.log(callLogs[index]['Callernumber'] +' found call log')
                // console.log('number' + number)
                if (number.length <= 6) {
                  foundDepartmentDetail = _.findWhere(userDetails, {
                    extension: parseInt(number),
                  });
                  // console.log('foundDepartmentDetail' + foundDepartmentDetail)
                  if (
                    foundDepartmentDetail &&
                    foundDepartmentDetail["department"] != "all"
                  ) {
                    updateData = {
                      department: foundDepartmentDetail["department"],
                      departmentCalculated: true,
                    };
                  }
                }
              }

              //Updating the call log with department
              console.log("update data", updateData);
              if (updateData && Object.keys(updateData).length) {
                await CALL_LOGS.findByIdAndUpdate(
                  { _id: callLogs[index]["_id"] },
                  { $set: updateData }
                );
              }

              number = foundDepartmentDetail = null;
            }
          }
        }

        callLogs = keys = groupedCallLogs = null;
      }
    } catch (err) {
      console.log("Error in figuring branch name", err);
    }
  }
);

findDepartmentInfoForCallLog.start();

// Find Caller Name for the Call log
var findCallerNameInfoForCallLog = new CronJob(
  "*/1 * * * *",
  async function () {
    let callLogs = await CALL_LOGS.find(
      { callerNameCalculated: false },
      "Callernumber callerNameCalculated organization",
      { limit: 5000, sort: { creationDate: -1 } }
    ).lean();

    if (callLogs && callLogs.length) {
      let groupedCallLogs = _.groupBy(callLogs, "organization");
      let keys = Object.keys(groupedCallLogs);

      for (let kI in keys) {
        callLogs = groupedCallLogs[keys[kI]];
        let extensions = [];

        // Get extensions from call logs
        {
          extensions = _.uniq(
            _.difference(
              _.map(_.pluck(callLogs, "Callernumber"), function (se) {
                se = String(se);

                if (se.length <= 6 && !isNaN(parseInt(se))) {
                  return parseInt(se);
                } else {
                  return null;
                }
              }),
              [undefined, null]
            )
          );
        }

        console.log("find caller name");
        // Get user details from the user and separate branch, department and names for extension
        let userDetails = [];
        if (extensions && extensions.length) {
          console.log("Keys", keys[kI]);
          userDetails = await USER.find(
            {
              softDelete: false,
              // organization: keys[kI],
              extension: { $in: extensions },
            },
            "extension"
          ).lean();
        }
        {
          let updateData;
          for (let index in callLogs) {
            updateData = {};
            let callerExtension, callerNumber;
            // for Caller Name
            if (!callLogs[index]["callerNameCalculated"]) {
              callerNumber = String(callLogs[index]["Callernumber"]);

              if (callerNumber.length <= 6) {
                callerExtension = _.findWhere(userDetails, {
                  extension: parseInt(callLogs[index]["Callernumber"]),
                });

                if (callerExtension) {
                  updateData["callerUser"] = callerExtension["_id"];
                  updateData["callerNameCalculated"] = true;
                }
              } else if (callerNumber.length > 5) {
                updateData["callerNameCalculated"] = true;
              }
            }

            if (updateData && Object.keys(updateData).length) {
              // console.log("updateData", updateData);
              await CALL_LOGS.findByIdAndUpdate(
                { _id: callLogs[index]["_id"] },
                { $set: updateData }
              );
            }
            callerName = callerNumber = null;
          }
        }
      }
      callLogs = keys = groupedCallLogs = null;
    }
  }
);

findCallerNameInfoForCallLog.start();

// Calculate Transfer Call for the Call log
var checkForTransferCallLog = new CronJob("*/1 * * * *", async function () {
  let query = [
    { $match: { transferCallCalculated: false } },
    {
      $group: {
        _id: "$CallId",
        CallTime: { $first: "$CallTime" },
        data: {
          $push: {
            _id: "$$ROOT._id",
            CallTime: "$$ROOT.CallTime",
            Callednumber: "$$ROOT.Callednumber",
            DialedNumber: "$$ROOT.DialedNumber",
            transferCallCalculated: "$$ROOT.transferCallCalculated",
            CallType: "$$ROOT.CallType",
            parentTransferCallLog: "$$ROOT.parentTransferCallLog",
            organization: "$$ROOT.organization",
            Party1Device: "$$ROOT.Party1Device",
            CallId: "$$ROOT.CallId",
            CallDuration: "$$ROOT.CallDuration",
          },
        },
      },
    },
  ];

  let retDocs = await CALL_LOGS.aggregate(query);

  if (retDocs && retDocs.length) {
    for (let retDoc of retDocs) {
      if (retDoc && retDoc.data && retDoc.data.length >= 3) {
        console.log("RET DOC", retDoc.data);
        let max = -1;
        let requiredLog;

        for (let cL of retDoc.data) {
          let number = cL["Party1Device"]
            ? cL["Party1Device"].substring(1)
            : "";

          if (number !== cL["Callednumber"]) {
            if (cL["CallDuration"] >= max) {
              max = cL["CallDuration"];
              requiredLog = cL;
            }

            await CALL_LOGS.findByIdAndUpdate(
              { _id: cL["_id"] },
              { $set: { transferCallCalculated: true } }
            );
          } else {
            await CALL_LOGS.findByIdAndUpdate(
              { _id: cL["_id"] },
              { $set: { transferCallCalculated: true } }
            );
          }
        }

        if (requiredLog) {
          await CALL_LOGS.findByIdAndUpdate(
            { _id: requiredLog["_id"] },
            {
              $set: {
                transferCallCalculated: true,
                parentTransferCallLog: true,
              },
              $push: { CallType: "transfer" },
            }
          );
        }
      } else {
        for (let cL of retDoc.data) {
          await CALL_LOGS.findByIdAndUpdate(
            { _id: cL["_id"] },
            { $set: { transferCallCalculated: true } }
          );
        }
      }
    }
  }
});

checkForTransferCallLog.start();

async function fetchTariffDetails(organizations) {
  let aggregateQuery = [
    {
      $match: {
        organization: { $in: organizations },
        softDelete: false,
      },
    },
    {
      $lookup: {
        from: "assigntariffs",
        localField: "provider",
        foreignField: "provider",
        as: "assigntariffDocs",
      },
    },
    {
      $unwind: {
        path: "$assigntariffDocs",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "tariffrateandtimes",
        localField: "_id",
        foreignField: "tariffId",
        as: "tariffRateAndTimeDocs",
      },
    },
    {
      $unwind: {
        path: "$tariffRateAndTimeDocs",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        organization: "$assigntariffDocs.organization",
        // provider: "$assigntariffDocs.provider",
        branch: "$assigntariffDocs.branch",
        countryCode: 1,
        units: 1,
        unitsMeasurement: 1,
        // _id: 1,
        // rateId: "$tariffRateAndTimeDocs._id",
        // specialRate: "$tariffRateAndTimeDocs.specialRate"
        callType: 1,
        rate: "$tariffRateAndTimeDocs.rate",
      },
    },
  ];

  let retDoc = await TARIFF_DETAILS.aggregate(aggregateQuery);
  // console.log(String(retDoc + " result retrtttt");
  return retDoc;
}

// Find Called Name for the Call log
var findCalledNameInfoForCallLog = new CronJob(
  "*/1 * * * *",
  async function () {
    let callLogs = await CALL_LOGS.find(
      { calledNameCalculated: false },
      "Callednumber DialedNumber calledNameCalculated organization",
      { limit: 5000, sort: { creationDate: -1 } }
    ).lean();

    if (callLogs && callLogs.length) {
      let groupedCallLogs = _.groupBy(callLogs, "organization");
      let keys = Object.keys(groupedCallLogs);

      for (let kI in keys) {
        console.log("Keys", keys[kI]);
        callLogs = groupedCallLogs[keys[kI]];
        let extensions = [];

        // Get extensions from call logs
        {
          extensions = _.union(
            _.pluck(callLogs, "DialedNumber"),
            _.pluck(callLogs, "Callednumber")
          );
          extensions = _.uniq(
            _.difference(
              _.map(extensions, function (se) {
                se = String(se);

                if (se.length <= 6 && !isNaN(parseInt(se))) {
                  return parseInt(se);
                } else {
                  return null;
                }
              }),
              [undefined, null]
            )
          );
        }

        // Get user details from the user and separate branch, department and names for extension
        let userDetails = [];
        if (extensions && extensions.length) {
          userDetails = await USER.find(
            {
              softDelete: false,
              organization: keys[kI],
              extension: { $in: extensions },
            },
            "extension"
          ).lean();
        }

        {
          let updateData;
          for (let index in callLogs) {
            updateData = {};
            let callerExtension, calledNumber;
            // for Caller Name
            if (!callLogs[index]["calledNameCalculated"]) {
              calledNumber = String(callLogs[index]["Callednumber"]);

              if (calledNumber.length <= 6) {
                callerExtension = _.findWhere(userDetails, {
                  extension: parseInt(calledNumber),
                });

                if (callerExtension) {
                  updateData["calledUser"] = callerExtension["_id"];
                  updateData["calledNameCalculated"] = true;
                }
              } else if (calledNumber.length > 5) {
                updateData["calledNameCalculated"] = true;
              }

              calledNumber = String(callLogs[index]["DialedNumber"]);

              if (calledNumber.length <= 6) {
                callerExtension = _.findWhere(userDetails, {
                  extension: parseInt(calledNumber),
                });

                if (callerExtension) {
                  updateData["calledUser"] = callerExtension["_id"];
                  updateData["calledNameCalculated"] = true;
                }
              } else if (calledNumber.length > 5) {
                updateData["calledNameCalculated"] = true;
              }
            }

            if (updateData && Object.keys(updateData).length) {
              // console.log("updateData", updateData);
              await CALL_LOGS.findByIdAndUpdate(
                { _id: callLogs[index]["_id"] },
                { $set: updateData }
              );
            }
            callerName = calledNumber = null;
          }
        }
      }
      callLogs = keys = groupedCallLogs = null;
    }
  }
);

// findCalledNameInfoForCallLog.start();
