var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var tariffFileSchema = new Schema({
  organization: {type: Schema.Types.ObjectId, ref:"Organization", required: true},
  name        : {type: String, required: true},
  nameSaved   : {type: String, required: true},
  type        : {type: String},
  extension   : {type: String, required: true},
  fileErrors  : {type: Array},
  // Date Related Info
  creationDate: {type: Date},
  creationBy: {type: Schema.Types.ObjectId, ref: "User"},
  deletionDate: {type: Date},
  deletedBy: {type: Schema.Types.ObjectId, ref: "User"},
  updationDate: {type: Date},
  updatedBy: {type: Schema.Types.ObjectId, ref: "User"},
  softDelete: {type: Boolean, required:true, default: false}
});

module.exports = mongoose.model('TariffFile', tariffFileSchema);