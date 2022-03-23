var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var callErrorLogsSchema = new Schema({
  error : Object
});

module.exports = mongoose.model('callErrorLogs', callErrorLogsSchema);