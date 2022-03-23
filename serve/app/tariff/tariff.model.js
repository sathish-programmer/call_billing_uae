var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var tariffSchema = new Schema({
  organization    : {type: Schema.Types.ObjectId, ref:"Organization", required: true},
  provider        : {type: Schema.Types.ObjectId, ref:"Provider", required: true},
  name            : {type: String, required: true},
  priority        : {type: String},
  type            : {type: String, required: true},
  countryCode     : {type: String},
  externalId      : {type: String},
  trunkId         : {type: String},
  units           : {type: Number, required: true},
  unitsMeasurement: {type: String, required: true},
  currency        : {type: Schema.Types.ObjectId, ref: "Currency", required: true},
  calculationType : {type: String, required: true},
  timeZone        : {type: Schema.Types.ObjectId, ref: "Timezone", required: true},
  callType        : {type: String, required: true},
  description     : {type: String}, 
  // Date Related Info
  creationDate    : {type: Date},
  creationBy      : {type: Schema.Types.ObjectId, ref: "User"},
  deletionDate    : {type: Date},
  deletedBy       : {type: Schema.Types.ObjectId, ref: "User"},
  updationDate    : {type: Date},
  updatedBy       : {type: Schema.Types.ObjectId, ref: "User"},
  softDelete      : {type: Boolean, required:true, default: false}
});

module.exports = mongoose.model('Tariff', tariffSchema);