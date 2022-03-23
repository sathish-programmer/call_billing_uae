var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var departmentSchema = new Schema({
  name: {type: String, required: true},
  organization: {type: Schema.Types.ObjectId, ref: "Organization", required: true},
  branch: {type: Schema.Types.ObjectId, ref: "Branch", required: true},
  // Date Related Info
  creationDate: {type: Date},
  creationBy: {type: Schema.Types.ObjectId, ref: "User"},
  deletionDate: {type: Date},
  deletedBy: {type: Schema.Types.ObjectId, ref: "User"},
  updationDate: {type: Date},
  updatedBy: {type: Schema.Types.ObjectId, ref: "User"},
  softDelete: {type: Boolean, required:true, default: false}
});

module.exports = mongoose.model('Department', departmentSchema);