const CALL_REPORT_TEMPLATE = require("./call-report-template.model");

// Save the Call Report Template
exports.saveCallReportsTemplate = async (req, res) => {
  try {
    let body = req.body;
    let addedByName;
    if (req.user.type == "root") {
      addedByName = "superAdmin";
    } else {
      addedByName = "orgAdmin";
    }

    if (body.organization && body.startDate && body.endDate && body.fileName) {
      let dataToSave = new CALL_REPORT_TEMPLATE({
        organization: body.organization,
        user: req.user._id,
        startDate: body.startDate,
        endDate: body.endDate,
        extension: body.extension,
        fileName: body.fileName,
        dRTOption: body.dRTOption,
        branch: body.branch,
        department: body.department,
        callType: body.callType,
        reportType: body.reportType,
        direction: body.direction,
        groupBy: body.groupBy,
        orderBy: body.orderBy,
        searchByNumber: body.searchByNumber,
        costEnabled: body.costEnabled,
        softDelete: false,
        addedBy: addedByName,
      });
      if (
        await CALL_REPORT_TEMPLATE.findOne({
          fileName: body.fileName,
          softDelete: false,
        })
      ) {
        return res.json({
          success: false,
          data: "",
          message: "File name already exists",
        });
      } else {
        let retDoc = await dataToSave.save();

        return res.json({
          success: true,
          data: retDoc["_id"],
          message: "Saved",
        });
      }
    } else {
      return res.json({ success: false, data: "", message: "Missing data" });
    }
  } catch (err) {
    console.log("Error while saving reports filter", err);
    return res.json({ succes: false, data: "", message: err });
  }
};

// Update the Call Report Template
exports.updateCallReportTemplate = async (req, res) => {
  try {
    let body = req.body;
    let params = req.params;

    let addedByName;
    if (req.user.type == "root") {
      addedByName = "superAdmin";
    } else {
      addedByName = "orgAdmin";
    }

    if (body.organization && body.startDate && body.endDate && body.fileName) {
      let retDoc = await CALL_REPORT_TEMPLATE.findByIdAndUpdate(
        {
          _id: params.saveCallReportsFilterId,
          user: req.user._id,
          softDelete: false,
        },
        {
          $set: {
            startDate: body.startDate,
            endDate: body.endDate,
            extension: body.extension,
            fileName: body.fileName,
            dRTOption: body.dRTOption,
            branch: body.branch,
            department: body.department,
            callType: body.callType,
            reportType: body.reportType,
            direction: body.direction,
            groupBy: body.groupBy,
            orderBy: body.orderBy,
            searchByNumber: body.searchByNumber,
            costEnabled: body.costEnabled,
            addedBy: addedByName,
          },
        }
      );

      return res.json({ success: true, data: retDoc["_id"], message: "Saved" });
    } else {
      return res.json({ success: false, data: "", message: "Missing data" });
    }
  } catch (err) {
    console.log("Error while saving reports filter", err);
    return res.json({ succes: false, data: "", message: err });
  }
};

// save the Call Report Template for extension summary
exports.saveExtensionCallReportsTemplate = async (req, res) => {
  try {
    let body = req.body;
    let addedByName;
    if (req.user.type == "root") {
      addedByName = "superAdmin";
    } else {
      addedByName = "orgAdmin";
    }

    if (
      req.user.organization &&
      body.startDate &&
      body.endDate &&
      body.fileName
    ) {
      let dataToSave = new CALL_REPORT_TEMPLATE({
        organization: req.user.organization,
        user: req.user._id,
        startDate: body.startDate,
        endDate: body.endDate,
        extension: body.extension,
        fileName: body.fileName,
        dRTOption: body.dRTOption,
        branch: body.branch,
        department: body.department,
        callType: body.callType,
        direction: body.direction,
        groupBy: body.groupBy,
        orderBy: body.orderBy,
        searchByNumber: body.searchByNumber,
        costEnabled: body.costEnabled,
        softDelete: false,
        showType: 1,
        addedBy: addedByName,
      });
      if (
        await CALL_REPORT_TEMPLATE.findOne({
          fileName: body.fileName,
          softDelete: false,
        })
      ) {
        return res.json({
          success: false,
          data: "",
          message: "File name already exists",
        });
      } else {
        let retDoc = await dataToSave.save();

        return res.json({
          success: true,
          data: retDoc["_id"],
          message: "Saved",
        });
      }
    } else {
      return res.json({ success: false, data: "", message: "Missing data" });
    }
  } catch (err) {
    console.log("Error while saving reports filter", err);
    return res.json({ succes: false, data: "", message: err });
  }
};

// Get the list of the Call Report Template
exports.getCallReportsTemplate = async (req, res) => {
  try {
    let params = req.params;
    console.log("checking user id for get temp ", req.user._id);
    console.log(req.body, "checking req orgg");
    let retDocs = await CALL_REPORT_TEMPLATE.find({
      // organization: params.orgId,
      addedBy: "superAdmin",
      softDelete: false,
    }).sort({ showType: -1 });

    //get record based on org
    let orgRec = await CALL_REPORT_TEMPLATE.find({
      organization: params.orgId,
      addedBy: "orgAdmin",
      softDelete: false,
    });

    retDocs.push(orgRec);

    let ressss = retDocs.flat();

    return res.json({ success: true, data: ressss, message: "Saved" });
  } catch (err) {
    console.log("Error while saving reports filter", err);
    return res.json({ succes: false, data: "", message: err });
  }
};

// Delete the Call Report Template
exports.deleteCallReportTemplate = async (req, res) => {
  try {
    let params = req.params;
    if (params.saveCallReportsFilterId) {
      let retDocs = await CALL_REPORT_TEMPLATE.findByIdAndUpdate(
        {
          _id: params.saveCallReportsFilterId,
          user: req.user._id,
          softDelete: false,
        },
        { $set: { softDelete: true } }
      );
      return res.json({ success: true, data: retDocs, message: "Saved" });
    } else {
      return res.json({
        success: false,
        data: "",
        message: "Missing Template Id",
      });
    }
  } catch (err) {
    console.log("Error while saving reports filter", err);
    return res.json({ succes: false, data: "", message: err });
  }
};
