var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var assignTariff = new Schema({
  organization: {type: Schema.Types.ObjectId, ref: "Organization"},
  branch: {type: Schema.Types.ObjectId, ref: "Branch"},
  provider: {type: Schema.Types.ObjectId, ref: "Provider"},
  description : {type: String},
 // Date Related Info
  creationDate: {type: Date},
  createdBy: {type: Schema.Types.ObjectId, ref: "User"},
  deletionDate: {type: Date},
  deletedBy: {type: Schema.Types.ObjectId, ref: "User"},
  updationDate: {type: Date},
  updatedBy: {type: Schema.Types.ObjectId, ref: "User"},
  softDelete: {type: Boolean, required:true, default: false}
});

module.exports = mongoose.model('assignTariff', assignTariff);