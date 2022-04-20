var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var paymentSchema = new Schema({
  otpSentEmail: { type: String },
  OTP: { type: String },
  resentCount: { type: Number },
  otpExpired: { type: Boolean, default: false },
  otpVerified: { type: Boolean, default: false },
  orgName: { type: String, required: true },
  organization: {
    type: Schema.Types.ObjectId,
    ref: "Organization",
    required: false,
  },
  typeOfPayment: { type: Number, required: true, default: 1 },
  currencySymbol: { type: String },
  package: { type: Number, required: true, default: 00 },
  availablePackage: { type: Number, required: true, default: 00 },
  // Date Related Info
  creationDate: { type: Date },
  deletionDate: { type: Date },
  updationDate: { type: Date },
  softDelete: { type: Boolean, required: true, default: false },
});

module.exports = mongoose.model("Payment", paymentSchema);
