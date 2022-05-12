const CALL_REPORT_TEMPLATE = require("./call-report-template.model");

// Save the Call Report Template
exports.saveCallReportsTemplate = async (req, res) => {
  try {
    let body = req.body;
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
        direction: body.direction,
        groupBy: body.groupBy,
        orderBy: body.orderBy,
        searchByNumber: body.searchByNumber,
        costEnabled: body.costEnabled,
        softDelete: false,
      });

      let retDoc = await dataToSave.save();

      return res.json({ success: true, data: retDoc["_id"], message: "Saved" });
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
            direction: body.direction,
            groupBy: body.groupBy,
            orderBy: body.orderBy,
            searchByNumber: body.searchByNumber,
            costEnabled: body.costEnabled,
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

// Get the list of the Call Report Template
exports.getCallReportsTemplate = async (req, res) => {
  try {
    let params = req.params;
    console.log(req.body, "checking req orgg");
    let retDocs = await CALL_REPORT_TEMPLATE.find({
      organization: params.orgId,
      softDelete: false,
    });
    return res.json({ success: true, data: retDocs, message: "Saved" });
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
