const CALL_LOG = require("./call-logs.model");
const CALL_ERROR_LOG = require("./call-error-logs.model");
const BRANCH = require("../branch/branch.model");
const DEPARTMENT = require("../department/department.model");
const USER = require("../user/user.model");
const moment = require("moment");

// Upload call log from the Avaya system to this Backend platform database
exports.uploadCallLog = async (req, res) => {
  try {
    let reqBranchName = req.body.branch;
    let reqOrgName = req.user.organization;
    let callLogs = req.body;

    // delete branch req name from api
    // delete callLogs.branch;

    let userDetailsFind;
    let branchNameFindedNew;

    let userDetailsFindDept;
    let deptFindNew;

    // fetch branch name based on extension
    if (callLogs.Direction == "O") {
      userDetailsFind = await USER.find(
        {
          softDelete: false,
          extension: callLogs.Callernumber,
          organization: reqOrgName,
        },
        "branch"
      ).lean();

      //find dept
      userDetailsFindDept = await USER.find(
        {
          softDelete: false,
          extension: callLogs.Callernumber,
          organization: reqOrgName,
        },
        "department"
      ).lean();
    } else if (callLogs.Direction == "I") {
      userDetailsFind = await USER.find(
        {
          softDelete: false,
          extension: callLogs.Callednumber,
          organization: reqOrgName,
        },
        "branch"
      ).lean();

      //find dept
      userDetailsFindDept = await USER.find(
        {
          softDelete: false,
          extension: callLogs.Callednumber,
          organization: reqOrgName,
        },
        "department"
      ).lean();
    }

    if (userDetailsFind) {
      let branchArr = []; //initializing array
      userDetailsFind.forEach((element) => {
        //using array function for call back
        for (var k in element) {
          //looping through each element of array
          branchArr.push(element[k]); //pushing each value of object present inside the branch
        }
      });
      branchNameFindedNew = branchArr[1];
    }

    console.log("branch finded");

    if (userDetailsFindDept) {
      let deptArr = []; //initializing array
      userDetailsFindDept.forEach((elements) => {
        //using array function for call back
        for (var kk in elements) {
          //looping through each element of array
          deptArr.push(elements[kk]); //pushing each value of object present inside the branch
        }
      });
      deptFindNew = deptArr[1];
      console.log(deptFindNew);
    }

    console.log("dept findedddddd");
    let dataToAppend = {
      // organization: req.user.organization,
      organizationCalculated: false,
      softDelete: false,
      callCostCalculated: false,
      callTypeCalculated: false,
      callerNameCalculated: false,
      calledNameCalculated: false,
      // branch: req.user.branch,
      // branchCalculated: true,
      branchCalculated: false,
      departmentCalculated: false,
      transferCallCalculated: false,
      parentTransferCallLog: false,
      creationDate: new Date(),
    };

    if (!Array.isArray(callLogs)) {
      callLogs = [callLogs];
    }

    for (let i = 0; i < callLogs.length; i++) {
      let callLog = { ...callLogs[i], ...dataToAppend };

      if (
        callLog["CallDuration"] &&
        typeof callLog["CallDuration"] == "string"
      ) {
        var hms = callLog["CallDuration"].split(":");
        callLog["CallDuration"] =
          +hms[0] * 60 * 60 + +hms[1] * 60 + +hms[2] * 1;
      } else if (
        callLog["CallDuration"] &&
        typeof callLog["CallDuration"] == "number"
      ) {
        //Do nothing
      } else {
        // call log is not string and Number
        callLog["CallDuration"] = 0;
      }

      try {
        let dataToSave = new CALL_LOG(callLog);
        await dataToSave.save();
      } catch (err) {
        callLog["error"] = err ? err.errors : {};
        let dataToSaveForErrorLog = new CALL_ERROR_LOG({ error: callLog });
        await dataToSaveForErrorLog.save();
      }
    }

    return res.json({ success: true, data: "", message: "Data saved" });
  } catch (err) {
    return res.json({ success: false, message: err, data: "" });
  }
};

// Get Branh list for the Reports Page
exports.getBranchList = async (req, res) => {
  try {
    let user = req.user;
    let query = req.query;

    if (user.type == "normal") {
      if (user.branch === "all") {
        let branchList = await BRANCH.find({
          softDelete: false,
          organization: user.organization,
        });

        return res.json({
          success: true,
          data: branchList,
          message: "Branch List",
        });
      } else {
        let branch = await BRANCH.findOne({
          softDelete: false,
          organization: user.organization,
          _id: user.branch,
        });

        return res.json({
          success: true,
          data: [branch],
          message: "Branch List",
        });
      }
    } else if (user.type == "root") {
      // SU, Can see all branches data
      if (query.organization) {
        let branchList = await BRANCH.find({
          softDelete: false,
          organization: query.organization,
        });

        return res.json({
          success: true,
          data: branchList,
          message: "Branch List",
        });
      } else {
        return res.json({
          success: false,
          data: [],
          message: "Organization required",
        });
      }
    }
  } catch (err) {
    return res.json({ success: false, message: err, data: "" });
  }
};

// Get Department list for the Reports page
exports.getDepartmentList = async (req, res) => {
  try {
    let user = req.user;
    let query = req.query;

    if (user.type == "normal") {
      if (user.department === "all") {
        let departmentQuery = {
          softDelete: false,
          organization: user.organization,
        };

        if (query.branch) {
          departmentQuery["branch"] = query.branch;
        }

        let departmentList = await DEPARTMENT.find(departmentQuery);

        return res.json({
          success: true,
          data: departmentList,
          message: "Department List",
        });
      } else {
        let departmentQuery = {
          softDelete: false,
          organization: user.organization,
          _id: user.department,
        };

        if (query.branch) {
          departmentQuery["branch"] = query.branch;
        }

        let department = await DEPARTMENT.findOne(departmentQuery);
        return res.json({
          success: true,
          data: [department],
          message: "Department List",
        });
      }
    } else if (user.type == "root") {
      if (query.organization) {
        let departmentQuery = {
          softDelete: false,
          organization: query.organization,
        };
        if (query.branch) {
          departmentQuery["branch"] = query.branch;
        }

        let departmentList = await DEPARTMENT.find(departmentQuery);

        return res.json({
          success: true,
          data: departmentList,
          message: "Branch List",
        });
      } else {
        return res.json({
          success: false,
          data: [],
          message: "Organization required",
        });
      }
    }
  } catch (err) {
    return res.json({ success: false, message: err, data: "" });
  }
};

// Get extension list for the Report Page
exports.getExtensionList = async (req, res) => {
  try {
    let user = req.user;
    let query = req.query;
    let userQuery = {
      softDelete: false,
      type: "normal",
      extension: { $nin: [null, undefined, ""] },
    };

    if (user.type == "normal") {
      userQuery["organization"] = user.organization;
    } else if (user.type == "root") {
      if (query.organization) {
        userQuery["organization"] = query.organization;
      } else {
        return res.json({
          success: false,
          data: [],
          message: "Organization required",
        });
      }
    }

    if (user.branch !== "all") {
      userQuery["branch"] = user.branch;
    }

    if (user.department !== "all") {
      userQuery["department"] = user.department;
    }

    if (query.branch) {
      userQuery["$or"] = [{ branch: query.branch }, { branch: "all" }];
    }

    if (query.department) {
      userQuery["$or"] = [
        { department: query.department },
        { department: "all" },
      ];
    }

    let retDocs = await USER.find(userQuery, "firstName lastName extension");
    return res.json({ success: true, data: retDocs, message: "User Doc" });
  } catch (err) {
    return res.json({ success: false, message: err, data: "" });
  }
};

exports.getAllCallLogs = async (req, res) => {
  try {
    let params = req.params;
    let query = req.query;

    if (params && params.orgId) {
      let filterQuery = {};
      if (parseInt(query.skip) && parseInt(query.limit)) {
        filterQuery["skip"] =
          (parseInt(query.skip) - 1) * parseInt(query.limit);
        filterQuery["limit"] = parseInt(query.limit);
      }

      let retDocs = await CALL_LOG.find(
        { organization: params.orgId },
        null,
        filterQuery
      )
        .populate("branch", "name")
        .populate("department", "name");
      let total = await CALL_LOG.countDocuments({ organization: params.orgId });

      return res.json({
        success: true,
        data: retDocs,
        total: total,
        message: "Found call logs",
      });
    } else {
      return res.json({
        success: false,
        data: "",
        message: "Organization required",
      });
    }
  } catch (err) {
    console.log("Error while getting call logs", err);
    return res.json({ success: false, data: "", message: err });
  }
};

// Get Call logs List for the CAll logs Dashboard like tables on the dashboard page
exports.getCallListForDashboard = async (req, res) => {
  try {
    let params = req.params;
    let body = req.body;
    let startDate = new Date(moment(body["startDate"]).utc(true));
    let endDate = new Date(moment(body["endDate"]).utc(true));

    if (params && params.orgId) {
      let filterQuery = { sort: { CallTime: -1 } };
      let callLogQuery = {
        organization: params.orgId,
        // CallTime: { $gte: body["startDate"], $lte: body["endDate"] },
        CallTime: { $gte: startDate, $lte: endDate },
      };

      if (body.type == "duration") {
        callLogQuery["CallDuration"] = { $gte: 1 };
        filterQuery["sort"] = { CallDuration: -1 };
      } else if (body["type"] == "cost") {
        callLogQuery["CallDuration"] = { $gte: 1 };
        filterQuery["sort"] = { CalculatedCost: -1 };
      } else if (body["type"] == "recent" || body["type"] == "trunk") {
        filterQuery["sort"] = { CallTime: -1 };
      } else if (body["type"] == "missed") {
        callLogQuery["CallDuration"] = 0;
        // callLogQuery['Direction'] = 'I';
        // callLogQuery['Direction'] = 'O';
        filterQuery["sort"] = { CallTime: -1 };
      }

      if (body["branchId"]) {
        callLogQuery["branch"] = body["branchId"];
      }

      if (parseInt(body.skip) && parseInt(body.limit)) {
        filterQuery["skip"] = (parseInt(body.skip) - 1) * parseInt(body.limit);
        filterQuery["limit"] = parseInt(body.limit);
      }

      let retDocs = await CALL_LOG.find(callLogQuery, null, filterQuery)
        .populate("branch", "name")
        .populate("department", "name");

      let total = await CALL_LOG.countDocuments(callLogQuery);

      // for (let index in retDocs) {
      //   retDocs[index]["CallTime"] =
      //     moment(retDocs[index]["CallTime"]).utc().format("L") +
      //     " " +
      //     moment(retDocs[index]["CallTime"]).utc().format("LT");
      // }

      return res.json({
        success: true,
        data: retDocs,
        total: total,
        message: "Found call logs",
      });
    } else {
      return res.json({
        success: false,
        data: "",
        message: "Organization required",
      });
    }
  } catch (err) {
    console.log("Error while getting call logs", err);
    return res.json({ success: false, data: "", message: err });
  }
};

// Get Call log summary for the CAll Dashboard page where it shows he Today's and Previous Day Summary
exports.getCallSummaryForDashboard = async (req, res) => {
  try {
    let params = req.params;
    let body = req.body;
    let startDate = new Date(moment(body["startDate"]).utc(true));
    let endDate = new Date(moment(body["endDate"]).utc(true));

    if (params && params.orgId) {
      var dataToFind = {
        organization: params["orgId"],
        // CallTime: {
        //   $gte: new Date(body["startDate"]),
        //   $lte: new Date(body["endDate"]),
        // },
        CallTime: { $gte: startDate, $lte: endDate },
      };
      var retDocs = await CALL_LOG.find(dataToFind, null, {
        sort: { CallTime: -1 },
      });

      for (var index in retDocs) {
        retDocs[index]["CallTime"] =
          moment(retDocs[index]["CallTime"]).utc().format("L") +
          " " +
          moment(retDocs[index]["CallTime"]).utc().format("LT");
      }

      return res.json({
        success: true,
        data: retDocs,
        message: "Found call logs",
      });
    } else {
      return res.json({
        success: false,
        data: "",
        message: "Organization required",
      });
    }
  } catch (err) {
    console.log("Error while getting call logs", err);
    return res.json({ success: false, data: "", message: err });
  }
};
