var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var branchSchema = new Schema({
  name: {type: String, required: true},
  description : {type: String},
  timeZone: {type: Schema.Types.ObjectId, ref: "Timezone"},
  country: {type: Schema.Types.ObjectId, ref: "Country"},
  organization: {type: Schema.Types.ObjectId, ref: "Organization"},
  type: {type: String, default: 'normal', required: true},
  street: {type: String},
  city: {type: String},
  state: {type: String},
  zipcode: {type: String},
  // Date Related Info
  creationDate: {type: Date},
  creationBy: {type: Schema.Types.ObjectId, ref: "User"},
  deletionDate: {type: Date},
  deletedBy: {type: Schema.Types.ObjectId, ref: "User"},
  updationDate: {type: Date},
  updatedBy: {type: Schema.Types.ObjectId, ref: "User"},
  softDelete: {type: Boolean, required:true, default: false}
});

module.exports = mongoose.model('Branch', branchSchema);