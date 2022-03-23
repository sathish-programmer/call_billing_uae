"use strict";

var express = require("express");
const COUNTRY = require("./country.model");
var router = express.Router();
let countryList = require("./country.const");

async function setMasterCountryList (req, res) {
    try {
        var data;
        for (var cL of countryList) {
            var dataToFind = {nameCommon: cL['name']['common'],
                              nameOfficial: cL['name']['official'],
                              callingCode: cL['callingCode'],
                              capital: cL['capital']};

            if(!await COUNTRY.findOne(dataToFind)) {
                data = new COUNTRY({nameCommon: cL['name']['common'],
                                    nameOfficial: cL['name']['official'],
                                    callingCode: cL['callingCode'],
                                    capital: cL['capital']})
                await data.save();
            }
        }

        return res.json({success: true, data: "", message: "Master Country List set"});
    } catch (err) {
        console.log("err", err);
        return res.json({success: false, data: "", message: "Something went wrong"});
    }
}

// Get List of the COuntry For Add Pages
async function getMasterCountryList (req, res) {
    await COUNTRY.find({callingCode: {"$ne": []}}, function(err, country) {
      if (err) return;
      res.json({ success: true, data: country });
    });
};

router.get("", getMasterCountryList);
router.post("", setMasterCountryList);
module.exports = router;