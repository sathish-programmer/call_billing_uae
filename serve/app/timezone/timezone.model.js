var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var timeZoneSchmea = new Schema({
  "name"         : {type: String},
  "abbreviation" : {type: String},
  "completeName" : {type: String},
  "offset"       : {type: String}
});

module.exports = mongoose.model("Timezone", timeZoneSchmea);