var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var tariffRateAndTimeSchema = new Schema({  
  organization         : {type: Schema.Types.ObjectId, ref:"Organization", required: true},
  tariffId             : {type: Schema.Types.ObjectId, ref: "Tariff", required: true},
  rate                 : {type: Number}, 
  specialRate          : {type: Number}, 
  rateStartDate        : {type: Date},         
  rateEndDate          : {type: Date},       
  specialRateStartDate : {type: Date},         
  specialRateEndDate   : {type: Date},       
  minimum              : {type: Number}, 
  maximum              : {type: Number}, 
  // Date Related Info
  creationDate         : {type: Date},
  creationBy           : {type: Schema.Types.ObjectId, ref: "User"},
  deletionDate         : {type: Date},
  deletedBy            : {type: Schema.Types.ObjectId, ref: "User"},
  updationDate         : {type: Date},
  updatedBy            : {type: Schema.Types.ObjectId, ref: "User"},
  softDelete           : {type: Boolean, required:true, default: false}
});

module.exports = mongoose.model('tariffRateAndTime', tariffRateAndTimeSchema);