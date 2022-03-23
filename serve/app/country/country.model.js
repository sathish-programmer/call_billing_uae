var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var countrySchema = new Schema({
    "nameCommon"    : {type: String},
    "nameOfficial"  : {type: String},
    "callingCode"   : {type: Array},
    "capital"       : {type: String},
});

module.exports = mongoose.model("Country", countrySchema);