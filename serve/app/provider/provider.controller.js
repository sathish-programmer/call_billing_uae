const PROVIDER = require("./provider.model");
const BRANCH = require("../branch/branch.model");
const {checkRole} = require("../middleware");
const { findOneAssignTariff,
        findOneTariff } = require("../dbConnection/dbQuery");

// Create Provider
exports.createProvider = async (req, res) => {
  try {
    let proceed = await checkRole(req.user['role'], "canAddProvider");

    if (proceed) {
      let body = req.body;

      if (body.name && body.organization && body.street 
          && body.city && body.stateOrPOBox && body.country) {
        if (await PROVIDER.findOne({name: body.name, 
                                    organization: body.organization, 
                                    softDelete: false})) {
          return res.json({ success: false, 
                            data: "", 
                            message: "Provider with same name already exists"});
        } else {
          let retDoc = new PROVIDER({ name: body.name,
                                      description : body.description || '',
                                      organization: body.organization,
                                      street: body.street,
                                      city: body.city,
                                      country: body.country,
                                      stateOrPOBox: body.stateOrPOBox,
                                      bldgBlock: body.bldgBlock || '',
                                      creationDate: new Date(),
                                      createdBy: req.user._id,
                                      softDelete: false});

          let doc = await retDoc.save();

          if (doc) {
            return res.json({success: true, data: doc['_id'], message: "Provider Added"});
          } else {
            return res.json({success: false, data: "", message: "Something went wrong"});
          }        
        }
      } else {
        return res.json({success: false, data:"", message: "Missing data"});
      }
    } else {
      return res.json({success: false, data:"", message: "Not Authorized"});
    }
  } catch (err) {
    console.log("Error while creating provider", err);
    return res.json({success: false, data:"", message: err});
  }
}

// Update Provider
exports.updateProvider = async (req, res) => {
  try {
    let proceed = await checkRole(req.user['role'], "canEditProvider");

    if (proceed) {
      let body = req.body;
      let params = req.params;

      if (body.name && body.organization && body.street 
        && body.city && body.stateOrPOBox && body.country && params.providerId) {
        if (await PROVIDER.findOne({name: body.name, organization: body.organization, 
                                    _id: {"$ne": params.providerId}, softDelete: false})) {
          return res.json({success: false, data: "", message: "Provider with same name already exists"});
        } else {
          let retDoc = await PROVIDER.findByIdAndUpdate({"_id": params.providerId, softDelete: false}, 
                                                        {"$set": {name: body.name,
                                                                  description : body.description || '',
                                                                  organization: body.organization,
                                                                  street: body.street,
                                                                  city: body.city,
                                                                  country: body.country,
                                                                  stateOrPOBox: body.stateOrPOBox,
                                                                  bldgBlock: body.bldgBlock || '',
                                                                  updationDate: new Date(),
                                                                  updatedBy: req.user._id}});

          if (retDoc) {
            return res.json({success: true, data: retDoc['_id'], message: "Provider Updated"});
          } else {
            return res.json({success: false, data: "", message: "Something went wrong"});
          }        
        }
      } else {
        return res.json({success: false, data:"", message: "Missing data"});
      }
    } else {
      return res.json({success: false, data:"", message: "Not Authorized"});
    }
  } catch (err) {
    console.log("Error while updating provider", err);
    return res.json({success: false, data:"", message: err});
  }
}

// Get Provider List
exports.getProviderList = async (req, res) => {
  try {
    let proceed = await checkRole(req.user['role'], "canRetrieveProvider");
    let params = req.params;
    let query = req.query;

    if (proceed && params.orgId) {                             
      let providerQuery = {organization: params.orgId,  softDelete: false};
      let filterQuery = {"sort": {"creationDate":-1}};

      if (parseInt(query.skip) && parseInt(query.limit)) {
        filterQuery['skip'] = (parseInt(query.skip) -1)*(parseInt(query.limit));
        filterQuery['limit'] = parseInt(query.limit);                
      }

      if (query.branch) {
        let branch = await BRANCH.findOne({_id: query.branch, softDelete: false}, "country");

        if (branch) {
          providerQuery['country'] = branch['country'];
        }
      }

      let retDoc = await PROVIDER.find(providerQuery, '', filterQuery)
                                  .populate("country", "nameCommon");
      let total = await PROVIDER.countDocuments(providerQuery);

      return res.json({success: true, data: retDoc, message: "List Found", total: total});
    } else {
      return res.json({success: false, data:"", message: "Not Authorized"});
    }
  } catch (err) {
    console.log("Error while retrieving provider list", err);
    return res.json({success: false, data:"", message: err});
  }
}

// Delete Provider List
exports.deleteProvider = async (req, res) => {
  try {
    let params = req.params;
    let proceed = await checkRole(req.user['role'], "canDeleteProvider");
    
    if (proceed) {
      if (params.providerId) {
        let query = {provider: params.providerId, softDelete: false};
        let proceed  = await findOneTariff(query);
        
        if (proceed) {
          return res.json({success: false, data: "", message: "Tariff linked with provider."});
        }

        proceed  = await findOneAssignTariff(query);
        
        if (proceed) {
          return res.json({success: false, data: "", message: "Assign Tariff linked with provider."});
        }

        await PROVIDER.findOneAndUpdate({_id: params.providerId, softDelete: false},
                                        {"$set": {softDelete: true}});

        return res.json({success: true, data:"", message: "Provider Deleted"});

      } else {
        return res.json({success: false, data: "", message: "Provider Missing"});
      }
    } else {
      return res.json({success: false, data: "", message: "Not Authorized"});
    }
  } catch (err) {
    console.log("Error while deleting provider", err);
    return res.json({success: false, data:"", message: err});
  }
}