const BRANCH = require("./branch.model");
const {checkRole} = require("../middleware");
const { findOneDepartment,
        findOneUser,
        findOneAssignTariff,
        findOneCallLog } = require("../dbConnection/dbQuery");

// Add Branch in the system
exports.addBranch = async (req, res) => {
  try {
    let proceed = await checkRole(req.user['role'], "canAddBranch");

    if (proceed) {
      let body = req.body;

      if (body.name && body.name.toLowerCase().trim() == 'all') {
        return res.json({success: false, data: "", message: "Branch Name not allowed"});
      }

      if (body.name && body.organization && body.timeZone && body.country) {
        if (await BRANCH.findOne({name: body.name, organization: body.organization, softDelete: false})) {
          return res.json({success: false, data: "", message: "Branch Name already exists with same name."});
        } else {
          let retDoc = new BRANCH({ name: body.name,
                                    description : body.description || '',
                                    organization: body.organization,
                                    timeZone: body.timeZone,
                                    country: body.country,
                                    type: "normal",
                                    state : body.state || '',
                                    city : body.city || '',
                                    zipcode : body.zipcode || '',
                                    street : body.street || '',
                                    creationDate: new Date(),
                                    createdBy: req.user._id,
                                    softDelete: false});

          let doc = await retDoc.save();

          if (doc) {
            return res.json({success: true, data: doc['_id'], message: "Branch Added"});
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
    console.log("Error while creating Branch", err);
    return res.json({success: false, data:"", message: err});
  }
}

// Update Branch in the system
exports.updateBranch = async (req, res) => {
  try {
    let proceed = await checkRole(req.user['role'], "canUpdateBranch");

    if (proceed) {
      let body = req.body;
      let params = req.params;
      
      if (body.name && body.name.toLowerCase().trim() == 'all') {
        return res.json({success: false, data: "", message: "Branch Name not allowed"});
      }

      if (body.name && params.branchId && body.organization && body.timeZone && body.country) {
        if (await BRANCH.findOne({name: body.name, organization: body.organization, _id: {"$ne": params.branchId}, softDelete: false})) {
          return res.json({success: false, data: "", message: "Branch with same name already exists"});
        } else {
          let retDoc = await BRANCH.findByIdAndUpdate( {_id: params.branchId, softDelete: false}, 
                                                      {"$set": {name: body.name,
                                                                description : body.description || '',
                                                                organization: body.organization,
                                                                timeZone: body.timeZone,
                                                                country: body.country,
                                                                state : body.state || '',
                                                                city : body.city || '',
                                                                zipcode : body.zipcode || '',
                                                                street : body.street || '',
                                                                updationDate: new Date(),
                                                                updatedBy: req.user._id}});

          if (retDoc) {
            return res.json({success: true, data: retDoc['_id'], message: "Branch Updated"});
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
    console.log("Error while updating branch", err);
    return res.json({success: false, data:"", message: err});
  }
}

// Get branch list for the Branch list view
exports.getBranchList = async (req, res) => {
  try {
    let proceed = await checkRole(req.user['role'], "canRetrieveBranch");
    let params = req.params;
    let query = req.query;

    if (proceed) {
      let branchQuery = {organization: params.orgId, softDelete: false};
      let filterQuery = {"sort": {"creationDate":-1}};

      if (parseInt(query.skip) && parseInt(query.limit)) {
        filterQuery['skip'] = (parseInt(query.skip) -1)*(parseInt(query.limit));
        filterQuery['limit'] = parseInt(query.limit);                
      }

      let branchList = await BRANCH.find(branchQuery, '', filterQuery)
                                    .populate("timeZone", "completeName")
                                    .populate("country", "nameCommon");
      let total = await BRANCH.countDocuments(branchQuery);

      return res.json({success: true, data: branchList, message: "List Found", total: total});                            
    } else {
      return res.json({success: false, data:"", message: "Not Authorized to list branch"});
    }
  } catch (err) {
    console.log("Error while getting branch list", err);
    return res.json({success: false, data:"", message: err});
  }
}

// Delete Branchw
exports.deleteBranch = async (req, res) => {
  try {
    let params = req.params;
    let proceed = await checkRole(req.user['role'], "canDeleteBranch");
    
    if (proceed) {
      if (params.branchId) {
        let query = {branch: params.branchId, softDelete: false};      
        let proceed  = await findOneDepartment(query);
        
        if (proceed) {
          return res.json({success: false, data: "", message: "Department linked with branch."});
        }

        proceed  = await findOneUser(query);
        
        if (proceed) {
          return res.json({success: false, data: "", message: "User linked with branch."});
        }

        proceed  = await findOneAssignTariff(query);
        
        if (proceed) {
          return res.json({success: false, data: "", message: "Assign Tariff linked with branch."});
        }

        proceed  = await findOneCallLog(query);
        
        if (proceed) {
          return res.json({success: false, data: "", message: "Call Logs linked with branch."});
        }

        await BRANCH.findOneAndUpdate({_id: params.branchId, softDelete: false, type: 'normal'},
                                      {"$set": {softDelete: true}});

        return res.json({success: true, data:"", message: "Branch Deleted"});

      } else {
        return res.json({success: false, data: "", message: "Branch Missing"});
      }
    } else {
      return res.json({success: false, data: "", message: "Not Authorized"});
    }
  } catch (err) {
    console.log("Error while deleting branch", err);
    return res.json({success: false, data:"", message: err});
  }
}