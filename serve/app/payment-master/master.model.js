var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var paymentMasterSchema = new Schema({
  packageAmount: { type: Number, required: true },
  packageName: { type: String, required: true },
  currencySymbol: { type: String, require: true, default: "$" },
  creationDate: { type: Date },
  deletionDate: { type: Date },
  updationDate: { type: Date },
  softDelete: { type: Boolean, required: true, default: false },
  currency: { type: Schema.Types.ObjectId, ref: "Currency", required: true },
});

module.exports = mongoose.model("paymentmaster", paymentMasterSchema);
