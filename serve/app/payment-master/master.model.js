var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var paymentMasterSchema = new Schema({
  packageAmount: { type: Number, required: true },
  packageName: { type: String, required: true },
  currency: { type: String, require: true, default: "$" },
  creationDate: { type: Date },
  deletionDate: { type: Date },
  updationDate: { type: Date },
  softDelete: { type: Boolean, required: true, default: false },
});

module.exports = mongoose.model("paymentmaster", paymentMasterSchema);
