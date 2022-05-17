var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var paymentSchema = new Schema({
  otpSentEmail: { type: String },
  OTP: { type: String },
  resentCount: { type: Number },
  otpExpired: { type: Boolean, default: false },
  otpVerified: { type: Boolean, default: false },
  orgName: { type: String },
  organization: {
    type: Schema.Types.ObjectId,
    ref: "Organization",
    required: false,
  },
  type: { type: String, default: "normal", required: true },
  typeOfPayment: { type: Number, required: true, default: 1 },
  currencySymbol: { type: String },
  package: { type: Number, required: true, default: 00 },
  availablePackage: { type: Number, required: true, default: 00 },
  // Date Related Info
  creationDate: { type: Date },
  deletionDate: { type: Date },
  updationDate: { type: Date },
  softDelete: { type: Boolean, required: true, default: false },
  paymentGoingToExpire: {
    type: Boolean,
  },
  notifiedAutomaticMail: {
    type: Number,
    default: 0,
  },

  notifiedPaymentExpiredMail: {
    type: Number,
    default: 0,
  },

  paymentTransactionId: { type: String },
});

module.exports = mongoose.model("Payment", paymentSchema);
