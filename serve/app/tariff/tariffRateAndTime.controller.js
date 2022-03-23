const TARIFF_RATE_TIME = require("./tariffRateAndTime.model");
const {checkRole} = require("../middleware");

// Add Tariff Rate and time for tariff
exports.addTariffRateAndTime = async (req, res) => {
  try {
    let proceed = checkRole(req.user._id, 'canAddTariffRateAndDate');
    if (proceed) {
      let body = req.body;
      if (body.organization && body.tariffId && body.rate && body.rateStartDate && body.rateEndDate) {
          let dataToSave = new TARIFF_RATE_TIME({ tariffId: body['tariffId'],
                                                  organization: body['organization'],
                                                  rate: body['rate'],
                                                  rateStartDate: body['rateStartDate'],   
                                                  rateEndDate: body['rateEndDate'],                    
                                                  specialRate : body['specialRate'],
                                                  specialRateStartDate : body['specialRateStartDate'],                             
                                                  specialRateEndDate : body['specialRateEndDate'],
                                                  minimum : body['minimum'],                        
                                                  maximum : body['maximum'],
                                                  creationDate: new Date(),
                                                  createdBy: req.user._id,
                                                  softDelete: false});                 
          
          let retDoc = await dataToSave.save();
          return res.json({success: true, data: retDoc['_id'], message: "Tariff rate and time added"});
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

// Update Tariff Rate and time for tariff
exports.updateTariffRateAndTime = async (req, res) => {
  try {
    let proceed = checkRole(req.user._id, 'canEditTariffRateAndDate');
    if (proceed) {
      let body = req.body;
      let params = req.params;

      if (body.organization && body.tariffId && params.tariffRateAndTimeId 
          && body.rate && body.rateStartDate && body.rateEndDate) {          
        let retDoc = await TARIFF_RATE_TIME.findByIdAndUpdate({ _id: params.tariffRateAndTimeId, 
                                                                tariffId: body.tariffId,
                                                                organization: body.organization,
                                                                softDelete: false},
                                                              {"$set": {tariffId: body['tariffId'],
                                                                        organization: body['organization'],
                                                                        rate: body['rate'],
                                                                        rateStartDate: body['rateStartDate'],   
                                                                        rateEndDate: body['rateEndDate'],                    
                                                                        specialRate : body['specialRate'],
                                                                        specialRateStartDate : body['specialRateStartDate'],                             
                                                                        specialRateEndDate : body['specialRateEndDate'],
                                                                        minimum : body['minimum'],                        
                                                                        maximum : body['maximum'],
                                                                        updationDate: new Date(),
                                                                        updatedBy: req.user._id}});

        return res.json({success: true, data: retDoc['_id'], message: "Tariff rate and time updated"});
      } else {
          return res.json({success: false, data:"", message: "Missing data"});
      }
    } else {
      return res.json({success: false, data:"", message: "Not authorized"});
    }
  } catch (err) {
    console.log("Error while update tariff rate and time", err);
    return res.json({success: false, data:"", message: err});
  }
}

// Delete Tariff Rate and time for tariff
exports.deleteTariffRateAndTime = async (req, res) => {
  try {
    let proceed = checkRole(req.user._id, 'canDeleteTariff');

    if (proceed) {
      let params = req.params;

      if (params.tariffRateAndTimeId) {
        await TARIFF_RATE_TIME.findByIdAndUpdate({_id: params.tariffRateAndTimeId, softDelete: false},
                                                {"$set": {"softDelete": true}});

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

// Get the list of  Tariff Rate and time for Single tariff
exports.getRateAndTimeAsPerTariff = async (req, res) => {
  try {
    let params = req.params;
    let proceed = checkRole(req.user._id, 'canEditTariff');

    if (proceed) {
      if (params.tariffId) {
        let retDocs = await TARIFF_RATE_TIME.find({tariffId: params.tariffId, softDelete: false});
        return res.json({success: true, data:retDocs, message: "Tariff Rate and time as per tariff"});
      } else {
        return res.json({success: false, data:"", message: "Tariff Id missing"});    
      }
    } else {
      return res.json({success: false, data:"", message: "Not authorized"});
    }
  } catch (err) {
    console.log("Error while fetching tariff rate and time as per tariff", err);
    return res.json({success: false, data:"", message: err});
  }
}