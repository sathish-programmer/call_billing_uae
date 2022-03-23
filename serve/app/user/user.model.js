var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
  firstName: {type: String, required: true},
  lastName: {type: String, required: true},
  organization: {type: Schema.Types.ObjectId, ref: "Organization", required: true},
  email: {type: String, required: true, unique: true},
  password: {type: String, required: true},
  country : {type: Schema.Types.ObjectId ,ref : "Country", required: true},
  role: {type: Schema.Types.ObjectId, ref: "Role", required: true},
  branch: {type: String, required: true},
  timeZone: {type: Schema.Types.ObjectId, ref: "Timezone", required: true},
  token : [{type: String}],
  department : {type: String, required: true},
  subdepartment: {type: Schema.Types.ObjectId, ref: "Subdepartment"},
  type: {type: String, default: 'normal', required: true},
  loginType: {type: String, default: 'normal', required: true},
  extension: {type: Number},
  enableLogin: {type: Boolean, default: false, required: true},
  // Date Related Info
  creationDate: {type: Date},
  creationBy: {type: Schema.Types.ObjectId, ref: "User"},
  deletionDate: {type: Date},
  deletedBy: {type: Schema.Types.ObjectId, ref: "User"},
  updationDate: {type: Date},
  updatedBy: {type: Schema.Types.ObjectId, ref: "User"},
  softDelete: {type: Boolean, required:true, default: false}
});

module.exports = mongoose.model('User', UserSchema);