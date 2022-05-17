const { Number } = require("mongoose");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var expiredTemplate = new Schema({
  subject: { type: String, required: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  type: { type: Number, required: true, default: 1 },
  status: { type: String, required: true, default: "active" },
  signature: { type: String, required: true },
  softDelete: { type: Boolean, required: true, default: false },
  creationDate: { type: Date },
  deletionDate: { type: Date },
  updationDate: { type: Date },
});

module.exports = mongoose.model("payment-over-template", expiredTemplate);
