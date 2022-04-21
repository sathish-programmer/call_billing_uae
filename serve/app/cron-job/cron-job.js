var CronJob = require("cron").CronJob;
const CALL_LOGS = require("../call-logs/call-logs.model");
const _ = require("underscore");
const TARIFF_DETAILS = require("../tariff/tariff.model");
const USER = require("../user/user.model");

// Calculate Call Type for the Call log
var calculateCallType = new CronJob("*/2 * * * *", async function () {
  console.log("Job triggered for calcualting call type");
  var callLogs = await CALL_LOGS.find({ callTypeCalculated: false }, "", {
    limit: 5000,
    sort: { creationDate: -1 },
  }).lean();

  if (callLogs && callLogs.length) {
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

      // if ((singleCallLog['ExternalTargetingCause'] && singleCallLog['ExternalTargetingCause'].indexOf('CfP') > 0)
      //   || (singleCallLog['ExternalTargetingCause'] && singleCallLog['ExternalTargetingCause'].indexOf('Cfd') > 0)
      //   || (singleCallLog['Direction'] && singleCallLog['Direction'] == 'C')) {
      //   type.push('conference');
      // }

      // TRANSFER CALL
      // if ((singleCallLog['ExternalTargetingCause'] && singleCallLog['ExternalTargetingCause'].indexOf('XfP') > 0)
      //   || (singleCallLog['ExternalTargetingCause'] && singleCallLog['ExternalTargetingCause'].indexOf('Xfd') > 0)) {
      //   type.push('transfer');
      // }

      // MISSED call
      if (
        singleCallLog["Direction"] &&
        singleCallLog["Direction"] == "I" &&
        singleCallLog["CallDuration"] == 0
      ) {
        type.push("missed");
      }

      //Internal call
      if (
        (singleCallLog["IsInternal"] &&
          singleCallLog["IsInternal"] == "1" &&
          singleCallLog["Direction"] &&
          singleCallLog["Direction"] == "O" &&
          singleCallLog["Callernumber"] &&
          String(singleCallLog["Callernumber"]).length >= 3 &&
          String(singleCallLog["Callernumber"]).length <= 5 &&
          singleCallLog["Callednumber"] &&
          singleCallLog["Callednumber"].length >= 3 &&
          singleCallLog["Callednumber"].length <= 5) ||
        (singleCallLog["Direction"] && singleCallLog["Direction"] == "0")
      ) {
        type.push("internal");
      }

      //Service call
      if (
        (singleCallLog["Callednumber"] &&
          singleCallLog["Callednumber"].indexOf("500") == 0) ||
        (singleCallLog["Callednumber"] &&
          singleCallLog["Callednumber"].indexOf("600") == 0) ||
        (singleCallLog["Callednumber"] &&
          singleCallLog["Callednumber"].indexOf("700") == 0) ||
        (singleCallLog["Callednumber"] &&
          singleCallLog["Callednumber"].indexOf("800") == 0) ||
        (singleCallLog["Callednumber"] &&
          singleCallLog["Callednumber"].indexOf("900") == 0)
      ) {
        type.push("service");
      }

      //local call
      if (
        singleCallLog["Callednumber"] &&
        singleCallLog["Callednumber"].indexOf("04") == 0
      ) {
        type.push("local");
      }

      if (
        singleCallLog["Callernumber"] &&
        String(singleCallLog["Callernumber"]).indexOf("04") == 0 &&
        String(singleCallLog["Callernumber"]).length == 9
      ) {
        type.push("local");
      }
      if (
        singleCallLog["Callernumber"] &&
        String(singleCallLog["Callernumber"]).indexOf("4") == 0 &&
        String(singleCallLog["Callernumber"]).length == 8
      ) {
        type.push("local");
      }
      //National

      if (
        (singleCallLog["Callernumber"] &&
          String(singleCallLog["Callernumber"]).indexOf("02") == 0 &&
          String(singleCallLog["Callernumber"]).length == 9) ||
        (singleCallLog["Callernumber"] &&
          String(singleCallLog["Callernumber"]).indexOf("03") == 0 &&
          String(singleCallLog["Callernumber"]).length == 9) ||
        (singleCallLog["Callernumber"] &&
          String(singleCallLog["Callernumber"]).indexOf("06") == 0 &&
          String(singleCallLog["Callernumber"]).length == 9) ||
        (singleCallLog["Callernumber"] &&
          String(singleCallLog["Callernumber"]).indexOf("07") == 0 &&
          String(singleCallLog["Callernumber"]).length == 9) ||
        (singleCallLog["Callernumber"] &&
          String(singleCallLog["Callernumber"]).indexOf("08") == 0 &&
          String(singleCallLog["Callernumber"]).length == 9) ||
        (singleCallLog["Callernumber"] &&
          String(singleCallLog["Callernumber"]).indexOf("09") == 0 &&
          String(singleCallLog["Callernumber"]).length == 9)
      ) {
        type.push("national");
      }

      if (
        (singleCallLog["Callernumber"] &&
          String(singleCallLog["Callernumber"]).indexOf("2") == 0 &&
          String(singleCallLog["Callernumber"]).length == 8) ||
        (singleCallLog["Callernumber"] &&
          String(singleCallLog["Callernumber"]).indexOf("3") == 0 &&
          String(singleCallLog["Callernumber"]).length == 8) ||
        (singleCallLog["Callernumber"] &&
          String(singleCallLog["Callernumber"]).indexOf("6") == 0 &&
          String(singleCallLog["Callernumber"]).length == 8) ||
        (singleCallLog["Callernumber"] &&
          String(singleCallLog["Callernumber"]).indexOf("7") == 0 &&
          String(singleCallLog["Callernumber"]).length == 8) ||
        (singleCallLog["Callernumber"] &&
          String(singleCallLog["Callernumber"]).indexOf("8") == 0 &&
          String(singleCallLog["Callernumber"]).length == 8) ||
        (singleCallLog["Callernumber"] &&
          String(singleCallLog["Callernumber"]).indexOf("9") == 0 &&
          String(singleCallLog["Callernumber"]).length == 8)
      ) {
        type.push("national");
      }

      if (
        (singleCallLog["Callednumber"] &&
          singleCallLog["Callednumber"].indexOf("02") == 0) ||
        (singleCallLog["Callednumber"] &&
          singleCallLog["Callednumber"].indexOf("03") == 0) ||
        (singleCallLog["Callednumber"] &&
          singleCallLog["Callednumber"].indexOf("06") == 0) ||
        (singleCallLog["Callednumber"] &&
          singleCallLog["Callednumber"].indexOf("07") == 0) ||
        (singleCallLog["Callednumber"] &&
          singleCallLog["Callednumber"].indexOf("08") == 0) ||
        (singleCallLog["Callednumber"] &&
          singleCallLog["Callednumber"].indexOf("09") == 0)
      ) {
        type.push("national");
      }

      //Mobile call
      if (
        singleCallLog["Callednumber"] &&
        singleCallLog["Callednumber"].indexOf("05") == 0
      ) {
        type.push("mobile");
      }

      // mobile bangalore call
      if (
        singleCallLog["Callednumber"] &&
        singleCallLog["Callednumber"].indexOf("80") == 0
      ) {
        type.push("mobile");
      }

      if (
        singleCallLog["Callernumber"] &&
        String(singleCallLog["Callernumber"]).indexOf("5") == 0 &&
        String(singleCallLog["Callernumber"]).length == 9
      ) {
        type.push("mobile");
      }

      if (
        singleCallLog["Callernumber"] &&
        String(singleCallLog["Callernumber"]).indexOf("05") == 0 &&
        String(singleCallLog["Callernumber"]).length == 10
      ) {
        type.push("mobile");
      }

      //International Call
      if (
        singleCallLog["Callednumber"] &&
        singleCallLog["Callednumber"].indexOf("00") == 0
      ) {
        type.push("international");
      }

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

        // Filter all tariff where the country code matches with the number
        let retDoc = tariffsPerOrg.filter((stpo) => {
          if (
            singleCallLog[lookInto] &&
            singleCallLog[lookInto].indexOf(stpo.countryCode) == 0
          ) {
            return stpo;
          }
        });

        // put all matched record's call type and assign it as the call type for the particular log
        if (retDoc && retDoc.length) {
          let allTypes = _.difference(_.pluck(retDoc, "callType"), [
            undefined,
            null,
            "",
          ]);
          type = [...type, ...allTypes];
        }
      }

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
var calculateCallCostJob = new CronJob("*/2 * * * *", async function () {
  console.log("Job triggered for calcualting cost for call logs");
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
      let tariffsPerOrg = _.difference(
        tariffDetails.filter((td) => {
          if (
            String(td.organization) == String(singleCallLog["organization"]) &&
            String(td.branch) == String(singleCallLog["branch"])
          ) {
            return td;
          }
        }),
        [undefined, null, ""]
      );

      // console.log("Call cost cycle variable", callCostCycleVariable);
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

        // Removing 00 from international number as INAIPI
        // people dont add tariff for numbers starting with 00
        if (number.indexOf("00") == 0) {
          number = number.substring(2, CallednumberLength);
          CallednumberLength = number.length;
        }

        console.log("Called Number", number);

        // if (CallednumberLength == 11) {
        //   number = number.substring(1, CallednumberLength);
        //   CallednumberLength = number.length;
        // }

        if (CallednumberLength > 10) {
          code = number.substring(0, 3);
          if (code == "971") {
            costCycleJson = _.findWhere(tariffsPerOrg, { countryCode: code });
          } else {
            //INTERNATIONAL
            code = number.substring(0, number.length % 10);
            // console.log("COde >10", code);
            costCycleJson = _.findWhere(tariffsPerOrg, { countryCode: code });
            console.log("total cycle", costCycleJson);
          }
          // console.log("Cost json", costCycleJson);
        } else if (CallednumberLength <= 10 && CallednumberLength >= 8) {
          // NATIONAL , LOCAL FOR DUBAI
          code = number.substring(0, 3);
          if (
            code == "500" ||
            code == "600" ||
            code == "700" ||
            code == "800" ||
            code == "181"
          ) {
            costCycleJson = _.findWhere(tariffsPerOrg, { countryCode: code });
          }
          // console.log("Code <=10 and >=8   -- 1", code);
          // console.log("Cost json", costCycleJson);
          if (!costCycleJson) {
            code = number.substring(0, 2);
            if (
              code == "05" ||
              code == "04" ||
              code == "02" ||
              code == "06" ||
              code == "09" ||
              code == "07" ||
              code == "03" ||
              code == "08"
            ) {
              costCycleJson = _.findWhere(tariffsPerOrg, { countryCode: code });
            }
            // console.log("Code <=10 and >=8   --2", code);
            // console.log("Cost json", costCycleJson);
          }
        } else {
          code = number.substring(0, 3);
          if (
            code == "500" ||
            code == "600" ||
            code == "700" ||
            code == "800" ||
            code == "181"
          ) {
            costCycleJson = _.findWhere(tariffsPerOrg, { countryCode: code });
          }
        }

        // console.log("Cost", cost);

        if (costCycleJson) {
          cost = parseFloat(costCycleJson["rate"]);
          oneCycle =
            parseInt(costCycleJson["units"]) *
            parseInt(costCycleJson["unitsMeasurement"]);
        }

        if (callLogs[index]["CallDuration"]) {
          totalCycles = Math.ceil(callLogs[index]["CallDuration"] / oneCycle);
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

// Find Branch Name for the Call log
var findBranchInfoForCallLog = new CronJob("*/2 * * * *", async function () {
  console.log("Job triggered for finding branch details for call log");
  let callLogs = await CALL_LOGS.find(
    { branchCalculated: false },
    "Callernumber Callednumber DialedNumber organization _id Direction",
    { limit: 5000, sort: { creationDate: -1 } }
  ).lean();
  console.log("cal logs", callLogs.length);
  try {
    if (callLogs && callLogs.length) {
      let groupedCallLogs = _.groupBy(callLogs, "organization");
      let keys = Object.keys(groupedCallLogs);
      console.log("Grouped call logs", groupedCallLogs);
      console.log("keys branch", keys);
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

                if (se.length <= 5 && !isNaN(parseInt(se))) {
                  return se;
                } else {
                  return null;
                }
              }),
              [undefined, null, ""]
            )
          );
        }

        console.log("extensions", extensions);

        // Get User extensions
        let userDetails = await USER.find(
          {
            extension: { $in: extensions },
            organization: keys[kI],
          },
          "branch extension"
        ).lean();

        console.log("user details", userDetails);
        // Tie branch with call log
        {
          let updateData;
          for (let index in callLogs) {
            updateData = {};
            let number,
              foundBranchDetail = {};

            if (callLogs[index]["Direction"] == "I") {
              number = String(callLogs[index]["Callednumber"]);

              if (number.length <= 5) {
                foundBranchDetail = _.findWhere(userDetails, {
                  extension: parseInt(number),
                });

                if (foundBranchDetail) {
                  updateData = {
                    branch: foundBranchDetail["branch"],
                    branchCalculated: true,
                  };
                }
              }

              if (!updateData["branch"]) {
                number = String(callLogs[index]["Dialednumber"]);
                if (number.length <= 5) {
                  foundBranchDetail = _.findWhere(userDetails, {
                    extension: parseInt(number),
                  });

                  if (foundBranchDetail) {
                    updateData = {
                      branch: foundBranchDetail["branch"],
                      branchCalculated: true,
                    };
                  }
                }
              }
            } else if (callLogs[index]["Direction"] == "O") {
              number = String(callLogs[index]["Callernumber"]);

              if (number.length <= 5) {
                foundBranchDetail = _.findWhere(userDetails, {
                  extension: parseInt(number),
                });

                if (foundBranchDetail) {
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

// findBranchInfoForCallLog.start();

// Find Department Name for the Call log
var findDepartmentInfoForCallLog = new CronJob(
  "*/2 * * * *",
  async function () {
    console.log("Job triggered for finding department call log");
    let callLogs = await CALL_LOGS.find(
      { departmentCalculated: false },
      "Callernumber Callednumber DialedNumber organization _id Direction",
      { limit: 5000, sort: { creationDate: -1 } }
    ).lean();
    console.log("cal logs", callLogs.length);
    try {
      if (callLogs && callLogs.length) {
        let groupedCallLogs = _.groupBy(callLogs, "organization");
        let keys = Object.keys(groupedCallLogs);

        console.log("Grouped call logs", groupedCallLogs);
        console.log("keys dept", keys);
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

                  if (se.length <= 5 && !isNaN(parseInt(se))) {
                    return se;
                  } else {
                    return null;
                  }
                }),
                [undefined, null, ""]
              )
            );
          }

          console.log("extensions", extensions);
          // Get User extensions
          let userDetails = await USER.find(
            {
              extension: { $in: extensions },
              organization: keys[kI],
            },
            "department extension"
          ).lean();
          console.log("user details", userDetails);
          // Tie department with call log
          {
            let updateData;
            for (let index in callLogs) {
              updateData = {};
              let number,
                foundDepartmentDetail = {};

              if (callLogs[index]["Direction"] == "I") {
                number = String(callLogs[index]["Callednumber"]);

                if (number.length <= 5) {
                  foundDepartmentDetail = _.findWhere(userDetails, {
                    extension: parseInt(number),
                  });

                  if (foundDepartmentDetail) {
                    updateData = {
                      department: foundDepartmentDetail["department"],
                      departmentCalculated: true,
                    };
                  }
                }

                if (!updateData["department"]) {
                  number = String(callLogs[index]["Dialednumber"]);
                  if (number.length <= 5) {
                    foundDepartmentDetail = _.findWhere(userDetails, {
                      extension: parseInt(number),
                    });

                    if (foundDepartmentDetail) {
                      updateData = {
                        department: foundDepartmentDetail["department"],
                        departmentCalculated: true,
                      };
                    }
                  }
                }
              } else if (callLogs[index]["Direction"] == "O") {
                number = String(callLogs[index]["Callernumber"]);

                if (number.length <= 5) {
                  foundDepartmentDetail = _.findWhere(userDetails, {
                    extension: parseInt(number),
                  });

                  if (foundDepartmentDetail) {
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

// findDepartmentInfoForCallLog.start();

// Find Caller Name for the Call log
var findCallerNameInfoForCallLog = new CronJob(
  "*/2 * * * *",
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

                if (se.length <= 5 && !isNaN(parseInt(se))) {
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
          console.log("Keys caller name", keys[kI]);
          userDetails = await USER.find(
            { organization: keys[kI], extension: { $in: extensions } },
            "extension"
          ).lean();
        }
        console.log("User details", userDetails);
        {
          let updateData;
          for (let index in callLogs) {
            updateData = {};
            let callerExtension, callerNumber;
            // for Caller Name
            if (!callLogs[index]["callerNameCalculated"]) {
              callerNumber = String(callLogs[index]["Callernumber"]);

              if (callerNumber.length <= 5) {
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

// Find Called Name for the Call log
var findCalledNameInfoForCallLog = new CronJob(
  "*/2 * * * *",
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
        console.log("Keys calledname", keys[kI]);
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

                if (se.length <= 5 && !isNaN(parseInt(se))) {
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
            { organization: keys[kI], extension: { $in: extensions } },
            "extension"
          ).lean();
        }
        console.log("User details", userDetails);

        {
          let updateData;
          for (let index in callLogs) {
            updateData = {};
            let callerExtension, calledNumber;
            // for Caller Name
            if (!callLogs[index]["calledNameCalculated"]) {
              calledNumber = String(callLogs[index]["Callednumber"]);

              if (calledNumber.length <= 5) {
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

              if (calledNumber.length <= 5) {
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

findCalledNameInfoForCallLog.start();

// Calculate Transfer Call for the Call log
var checkForTransferCallLog = new CronJob("*/2 * * * *", async function () {
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
  return retDoc;
}
