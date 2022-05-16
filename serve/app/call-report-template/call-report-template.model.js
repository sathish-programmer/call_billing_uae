var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var callReportTemplateSchema = new Schema({
  // Internat fields
  organization: {
    type: Schema.Types.ObjectId,
    ref: "Organization",
    required: true,
  },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  extension: { type: Array },
  fileName: { type: String, required: true },
  dRTOption: { type: String },
  branch: { type: Array },
  department: { type: Array },
  callType: { type: Array },
  direction: { type: Array },
  groupBy: { type: String },
  orderBy: { type: String },
  searchByNumber: { type: String },
  costEnabled: { type: Boolean },
  softDelete: { type: Boolean, default: false, required: true },
  addedBy: { type: String, default: "admin", required: true },
});

module.exports = mongoose.model("callReportTemplate", callReportTemplateSchema);
