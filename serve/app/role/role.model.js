var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var roleSchema = new Schema({
  name: {type: String, required: true},
  description : {type: String},
  organization: {type: Schema.Types.ObjectId, ref: "Organization", required: true},
  list: [{type: String, required: true}],
  type: {type: String, default: 'normal', required: true},
  // Date Related Info
  creationDate: {type: Date},
  creationBy: {type: Schema.Types.ObjectId, ref: "User"},
  deletionDate: {type: Date},
  deletedBy: {type: Schema.Types.ObjectId, ref: "User"},
  updationDate: {type: Date},
  updatedBy: {type: Schema.Types.ObjectId, ref: "User"},
  softDelete: {type: Boolean, required:true, default: false}
});

module.exports = mongoose.model('Role', roleSchema);