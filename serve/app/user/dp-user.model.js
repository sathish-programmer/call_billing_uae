var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var DPUserSchema = new Schema({
  firstName: {type: String, required: true},
  lastName: {type: String, required: true},
  organization: {type: Schema.Types.ObjectId, ref: "Organization", required: true},
  email: {type: String, required: true, unique: true},
  password: {type: String, required: true},
  token : [{type: String}],
  type: {type: String, default: 'dp', required: true},
  enableLogin: {type: Boolean, default: true, required: true},
  softDelete: {type: Boolean, required:true, default: false}
});

module.exports = mongoose.model('DpUser', DPUserSchema);