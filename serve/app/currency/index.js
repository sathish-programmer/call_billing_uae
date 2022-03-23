var express = require("express");
const CURRENCY = require("./currency.model");
var router = express.Router();
let currencyList = require("./currency.const");

async function setMasterCurrencyList(req, res) {
    try {
        var data;
        for (var cL of currencyList) {
            var dataToFind = {
                name: cL['name'],
                namePlural: cL['name_plural'],
                symbol: cL['symbol'],
                symbolNative: cL['symbol_native'],
                code: cL['code'],
                rounding: cL['rounding'],
                decimalDigits: cL['decimal_digits']
            };

            if (!await CURRENCY.findOne(dataToFind)) {
                data = new CURRENCY(dataToFind)
                await data.save();
            }
        }

        return res.json({ success: true, data: "", message: "Master Currency List set" });
    } catch (err) {
        console.log("err", err);
        return res.json({ success: false, data: "", message: "Something went wrong" });
    }
}

// Get Currency list for the Add page
async function getMasterCurrencyList(req, res) {
    await CURRENCY.find({}, "symbol name", {"sort": {"symbol":1 }}, function (err, country) {
        if (err) return;
        res.json({ success: true, data: country });
    });
};


router.get("", getMasterCurrencyList);
router.post("", setMasterCurrencyList);
module.exports = router;