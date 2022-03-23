var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var providerSchema = new Schema({
  organization: {type: Schema.Types.ObjectId, ref: "Organization"},
  name: {type: String, required: true},
  street: {type: String, required: true},
  city: {type: String, required: true},
  stateOrPOBox: {type: String, required: true},
  bldgBlock: {type: String},
  country: {type: Schema.Types.ObjectId, required: true, ref:"Country"},
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

module.exports = mongoose.model('Provider', providerSchema);