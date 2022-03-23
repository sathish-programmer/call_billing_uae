const CURRENCY = require("../currency/currency.model");
const TIME_ZONE = require("../timezone/timezone.model");
const PROVIDER = require("../provider/provider.model");
const TARIFF = require("./tariff.model");
const TARIFF_RATE_TIME = require("./tariffRateAndTime.model");
const TARIFF_FILE =  require("./tariffFile.model");
const _ = require("underscore");
const {checkRole} = require("../middleware");

// Save Tariff when uploaded using File
exports.saveTariffFromFile = async (req, res) => {
  try {
    let data = req.body;
    var currencyMasterList = await CURRENCY.find();
    var timeZoneMasterList = await TIME_ZONE.find();

    var tariffCompleteDetails = data['tariff'];
    var tariffFileId = data['fileId'];
    var tariffDetail, tariffRateAndTimeDetail, errors = [], errorJson;

    let providerNames = _.difference(_.uniq(_.pluck(_.pluck(tariffCompleteDetails, "tariffDetail"), "provider")), [undefined]);

    let providerRetDoc = []
    if (providerNames && providerNames.length) {
        providerRetDoc = await PROVIDER.find({organization: data.organization,
                                              softDelete: false,
                                              name: {"$in": providerNames}});
    }
    
    for (var index in tariffCompleteDetails) {
        tariffDetail = tariffCompleteDetails[index].tariffDetail;
        tariffRateAndTimeDetail = tariffCompleteDetails[index].tariffRateAndTimeDetail;
        errorJson = { name: tariffDetail['name'], 
                      externalId: tariffDetail['externalId'], 
                      provider: tariffDetail['provider'],
                      errors : []};

        let singleProvider = _.findWhere(providerRetDoc, {name: tariffDetail['provider']});
        if (singleProvider) {
            var tariffDataToInsert = new TARIFF({ organization: tariffDetail['organization'],
                                                  provider : singleProvider['_id'], 
                                                  countryCode: tariffDetail['countryCode'],
                                                  name: tariffDetail['name'],
                                                  trunkId: tariffDetail['trunkId'],
                                                  externalId: tariffDetail['externalId'],
                                                  type: tariffDetail['type'],
                                                  priority: tariffDetail['priority'],
                                                  units: tariffDetail['units'],
                                                  calculationType: tariffDetail['calculationType'],
                                                  unitsMeasurement: tariffDetail['unitsMeasurement'],
                                                  callType: tariffDetail['callType'].toLowerCase().trim(),
                                                  creationDate: new Date(),
                                                  createdBy: req.user._id});

            var checkData = { organization: tariffDetail['organization'],
                              provider : singleProvider['_id'], 
                              externalId: tariffDetail['externalId']};
            var singleCurrencyDoc = _.findWhere(currencyMasterList, {symbol: tariffDetail['currencyName']});

            if (singleCurrencyDoc) {
                tariffDataToInsert['currency'] = singleCurrencyDoc['_id'];
            } else {
                errorJson.errors.push({type: "Currency",
                                        detail: "Not able to find currency detail"});
            }

            var singleTimeZoneDoc = _.findWhere(timeZoneMasterList, {name: tariffDetail['timeZoneName']});

            if (singleTimeZoneDoc) {
                tariffDataToInsert['timeZone'] = singleTimeZoneDoc['_id'];
            } else {
                errorJson.errors.push({type: "Time Zone",
                                    detail: "Not able to find time zone detail"});
            }

            var details = await TARIFF.findOne(checkData, {"sort": {creationDate:-1}});

            if (details) {
                await setEndTime(details['_id'], tariffRateAndTimeDetail['rateStartDate']);
            }

            var tariffId = await tariffDataToInsert.save();

            var tariffRateAndTimeDataToInsert = new TARIFF_RATE_TIME({organization: tariffRateAndTimeDetail.organization,
                                                                      tariffId: tariffId,
                                                                      rate: tariffRateAndTimeDetail['rate'],
                                                                      specialRate: tariffRateAndTimeDetail['specialRate'],
                                                                      rateStartDate: new Date(tariffRateAndTimeDetail['rateStartDate']),
                                                                      rateEndDate: new Date(tariffRateAndTimeDetail['rateEndDate']),
                                                                      specialRateStartDate: new Date(tariffRateAndTimeDetail['specialRateStartDate']),
                                                                      specialRateEndDate: new Date(tariffRateAndTimeDetail['specialRateEndDate']),
                                                                      creationDate: new Date(),
                                                                      createdBy: req.user._id});

            await tariffRateAndTimeDataToInsert.save();

        } else {
            errorJson.errors.push({type: "Provider",
                                   detail: "Provider not found"});
        }

        if (errorJson.errors && errorJson.errors.length) {
            errors.push(errorJson);
        }
    }   

    if (errors && errors.length) {
        setFileErrors(errors, tariffFileId);
    }

    return res.json({success: true, data: '', message: "Tariff saved"});
  } catch (err) {
    console.log("Error while saving tariffs from the tariff file", err);
    return res.json({success: false, data: "", message: err});
  }
}

// Add Single Tariff when Done manually
exports.addTariff = async (req, res) => {
    try {
        let proceed = checkRole(req.user._id, 'canAddTariff');
        if (proceed) {
            let body = req.body;
            
            if (body.organization && body.provider && body.name && body.type && body.units 
                && body.currency && body.timeZone) {
                let dataToSave = new TARIFF({organization: body['organization'],
                                            provider: body['provider'],
                                            name: body['name'],
                                            priority: body['priority'],   
                                            type: body['type'],
                                            countryCode: body['countryCode'],
                                            externalId : body['externalId'],
                                            trunkId : body['trunkId'],
                                            units: body['units'],                    
                                            unitsMeasurement : body['unitsMeasurement'],
                                            currency : body['currency'],
                                            calculationType : body['calculationType'],
                                            timeZone : body['timeZone'], 
                                            callType: body['callType'],                               
                                            description : body['description'],
                                            creationDate: new Date(),
                                            createdBy: req.user._id,
                                            softDelete: false});                 
                
                let retDoc = await dataToSave.save();
                return res.json({success: true, data: retDoc['_id'], message: "Tariff Added"});
            } else {
                return res.json({success: false, data:"", message: "Missing data"});
            }
        } else {
            return res.json({success: false, data:"", message: "Not authorized"});
        }
    } catch (err) {
        console.log("Error while adding tariff", err);
        return res.json({success: false, data:"", message: err});
    }
}

// Update Single Tariff using edit tariff functionality
exports.updateTariff = async (req, res) => {
    try {
        let proceed = checkRole(req.user._id, 'canEditTariff');
        if (proceed) {
            let body = req.body;
            let params = req.params;

            if (body.organization && body.provider && body.name && body.type && body.units 
                && body.currency && body.timeZone && params.tariffId) {
                
                let retDoc = await TARIFF.findByIdAndUpdate({ _id: params.tariffId, 
                                                                organization: body.organization,
                                                                softDelete: false},
                                                            {"$set": {provider: body['provider'],
                                                                        name: body['name'],
                                                                        priority: body['priority'],   
                                                                        type: body['type'],
                                                                        countryCode: body['countryCode'],
                                                                        externalId : body['externalId'],
                                                                        trunkId : body['trunkId'],
                                                                        units: body['units'],                    
                                                                        unitsMeasurement : body['unitsMeasurement'],
                                                                        currency : body['currency'],
                                                                        calculationType : body['calculationType'],
                                                                        timeZone : body['timeZone'],                                
                                                                        description : body['description'],
                                                                        callType: body['callType'],       
                                                                        updationDate: new Date(),
                                                                        updatedBy: req.user._id}});

                if (retDoc) {
                    return res.json({success: true, data: retDoc['_id'], message: "Tariff Updated"});
                } else {
                    return res.json({success: false, data: '', message: "Something went wrong"});
                }
            } else {
                return res.json({success: false, data:"", message: "Missing data"});
            }
        } else {
            return res.json({success: false, data:"", message: "Not authorized"});
        }
    } catch (err) {
        console.log("Error while adding tariff", err);
        return res.json({success: false, data:"", message: err});
    }
}

// Get tariff list for the list page
exports.getTariffList = async(req, res) => {
    try {
        let proceed = checkRole(req.user._id, 'canRetrieveTariff');
        let params = req.params;
        let query = req.query;

        if (proceed) {
            if (params.orgId) {
                let filterQuery = {sort: {creationDate:-1}};
                let tariffQuery = {organization: params.orgId, softDelete: false};

                if (parseInt(query.skip) && parseInt(query.limit)) {
                    filterQuery['skip'] = (parseInt(query.skip) -1)*(parseInt(query.limit));
                    filterQuery['limit'] = parseInt(query.limit);                
                }

                let retDocs = await TARIFF.find(tariffQuery, '', filterQuery)
                                        .populate('provider', 'name')
                                        .populate('timeZone', 'completeName');
                let total = await TARIFF.countDocuments(tariffQuery);

                return res.json({success: true, data: retDocs, total: total, message: "Tariff list found"});
            } else {
                return res.json({success: false, data:"", message: "Missing organization"});
            }
        } else {
            return res.json({success: false, data:"", message: "Not authorized"});
        }
    } catch (err) {
        console.log("Error while fetching tariff list", err);
        return res.json({success: false, data:"", message: err});
    }
}

// Get single tariff for the edit tariff part
exports.getSingleTariff = async(req, res) => {
    try {
        let params = req.params;
        let proceed = checkRole(req.user._id, 'canEditTariff');

        if (proceed) {
            if (params.tariffId) {
                let retDoc = await TARIFF.findOne({_id: params.tariffId, softDelete: false});
                return res.json({success: true, data:retDoc, message: "Single Tariff"});
            } else {
                return res.json({success: false, data:"", message: "Tariff Id missing"});    
            }
        } else {
            return res.json({success: false, data:"", message: "Not authorized"});
        }
    } catch (err) {
        console.log("Error while fetching single tariff", err);
        return res.json({success: false, data:"", message: err});
    }
}

// Delete tariff
exports.deleteTariff = async (req, res) => {
    try {
      let proceed = checkRole(req.user._id, 'canDeleteTariff');
  
      if (proceed) {
        let params = req.params;
  
        if (params.tariffId) {
            await TARIFF.findByIdAndUpdate( {_id: params.tariffId, softDelete: false},
                                            {"$set": {"softDelete": true}});
            await TARIFF_RATE_TIME.updateMany({tariffId: params.tariffId, softDelete: false},
                                              {"$set": {"softDelete": true}})
            return res.json({success: true, data:"", message: "Deleted successfully"});
        } else {
          return res.json({success: false, data:"", message: "Missing Tariff Rate and time"});
        }
      } else {
        return res.json({success: false, data:"", message: "Not Authorized"});
      }
    } catch (err) {
      console.log("Error while deleting tariff rate and time", err);
      return res.json({success: false, data:"", message: err});
    }
  }

async function setEndTime(tariffId, endDate) {
  await TARIFF_RATE_TIME.update({tariffId: tariffId}, 
                                {"$set": {rateEndDate: new Date(endDate), 
                                          specialRateEndDate: new Date(endDate)}});
}

async function setFileErrors(errors, fileId) {
  await TARIFF_FILE.update({_id: fileId}, 
                            {"$set": {fileErrors: errors}});
}