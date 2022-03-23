var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var currencySchema = new Schema({
    "name"         : {type: String},
    "namePlural"   : {type: String},
    "symbol"       : {type: String},
    "symbolNative" : {type: String},
    "code"         : {type: String},
    "decimalDigits": {type: Number},
    "rounding"     : {type: Number},
});

module.exports = mongoose.model("Currency", currencySchema);