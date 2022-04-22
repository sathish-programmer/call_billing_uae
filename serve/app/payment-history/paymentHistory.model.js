const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var paymentHistorySchema = new Schema({
  calculatedCost: { type: Number, required: true },
  availablePackage: { type: Number, required: true, default: 00 },
  creationDate: { type: Date },
  deletionDate: { type: Date },
  updationDate: { type: Date },
  softDelete: { type: Boolean, required: true, default: false },
  organization: {
    type: Schema.Types.ObjectId,
    ref: "Organization",
    required: true,
  },
  uniqueId: { type: String, required: true },
  costPaidDate: { type: Date },
  isCostCalculated: { type: Boolean, required: true, default: false },
});

module.exports = mongoose.model("paymentHistory", paymentHistorySchema);
