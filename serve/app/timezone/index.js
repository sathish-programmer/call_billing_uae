"use strict";

var express = require("express");
const TIME_ZONE = require("./timezone.model");
var router = express.Router();
const TimeZoneList = require("./timeZone.const");

async function setMasterTimeZone(req, res) {
    var data;
    for (var index in TimeZoneList) {
        var dataToFind = {name: TimeZoneList[index]['Name'],
                            abbreviation: TimeZoneList[index]['Abbreviation'],
                            completeName: TimeZoneList[index]['DisplayName'],
                            offset: TimeZoneList[index]['Offset']};
        
        if (!await TIME_ZONE.findOne(dataToFind)) {
            data = new TIME_ZONE({name: TimeZoneList[index]['Name'],
                                abbreviation: TimeZoneList[index]['Abbreviation'],
                                completeName: TimeZoneList[index]['DisplayName'],
                                offset: TimeZoneList[index]['Offset']})
            await data.save();
        }
    }

    return res.json({success: "Time Zone Master list Set"});
};

// Get list of timezones
async function getTimeZoneList(req, res)  {
    try {
        var retDoc = await TIME_ZONE.find({}, null, {"sort" : {completeName:1}});

        return res.json({success: true, data: retDoc, message: "Data found"});
    } catch (err) {
        return res.json({success: false, data: [], message: err});
    }
}

router.get("", getTimeZoneList);
router.post("", setMasterTimeZone);

module.exports = router;