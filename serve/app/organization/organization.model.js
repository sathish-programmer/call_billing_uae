var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var organizationSchema = new Schema({
  name: {type: String, required: true},
  description : {type: String},
  parent: {type: Schema.Types.ObjectId, ref: "Organization"},
  type: {type: String, default: 'normal', required: true},
 // Date Related Info
  creationDate: {type: Date},
  createdBy: {type: Schema.Types.ObjectId, ref: "User"},
  deletionDate: {type: Date},
  deletedBy: {type: Schema.Types.ObjectId, ref: "User"},
  updationDate: {type: Date},
  updatedBy: {type: Schema.Types.ObjectId, ref: "User"},
  softDelete: {type: Boolean, required:true, default: false}
});

module.exports = mongoose.model('Organization', organizationSchema);