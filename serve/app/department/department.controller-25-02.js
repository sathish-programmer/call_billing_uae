const DEPARTMENT = require("./department.model");
const {checkRole} = require("../middleware");
const { findOneSubdepartment,
        findOneUser,      
        findOneCallLog } = require("../dbConnection/dbQuery");

// Add Department functionality
exports.addDepartment = async (req, res) => {
  try {
    let proceed = await checkRole(req.user['role'], "canAddDepartment");

    if (proceed) {
      let body = req.body;

      if (body.name && body.name.toLowerCase().trim() == 'all') {
        return res.json({success: false, data: "", message: "Department Name not allowed"});
      }

      if (body.name && body.organization && body.branch) {
        if (await DEPARTMENT.findOne({name: body.name, organization: body.organization, branch: body.branch, softDelete: false})) {
          return res.json({success: false, data: "", message: "Department already exists in same organization and branch"});
        } else {
          let retDoc = new DEPARTMENT({ name: body.name,
                                        organization : body.organization,
                                        branch: body.branch,
                                        creationDate: new Date(),
                                        createdBy: req.user._id,
                                        softDelete: false});

          let doc = await retDoc.save();

          if (doc) {
            return res.json({success: true, data: doc['_id'], message: "Department Added"});
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
    console.log("Error while creating department", err);
    return res.json({success: false, data:"", message: err});
  }
}

// Update Department functionality
exports.updateDepartment = async (req, res) => {
  try {
    let proceed = await checkRole(req.user['role'], "canUpdateDepartment");

    if (proceed) {
      let body = req.body;
      let params = req.params;

      if (body.name && body.name.toLowerCase().trim() == 'all') {
        return res.json({success: false, data: "", message: "Department Name not allowed"});
      }

      if (body.name && params.departmentId && body.organization && body.branch) {
        if (await DEPARTMENT.findOne({name: body.name, branch: body.branch, 
                                      organization: body.organization, 
                                      _id: {"$ne": params.departmentId}, 
                                      softDelete: false})) {
          return res.json({success: false, data: "", message: "Department with same name already exists"});
        } else {
          let retDoc = await DEPARTMENT.findByIdAndUpdate( {_id: params.departmentId, softDelete: false}, 
                                                           {"$set": { name: body.name,
                                                                      updationDate: new Date(),
                                                                      updatedBy: req.user._id}});

          if (retDoc) {
            return res.json({success: true, data: retDoc['_id'], message: "Department Updated"});
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
    console.log("Error while updating department", err);
    return res.json({success: false, data:"", message: err});
  }
}

// Get Department List
exports.getDepartmentList = async (req, res) => {
  try {
    let proceed = await checkRole(req.user['role'], "canRetrieveDepartment");
    let params = req.params;
    let query = req.query;

    if (proceed) {
      let dbQuery = {organization: params.orgId, softDelete: false};
      let filterQuery = {"sort": {"creationDate":-1}};

      if (parseInt(query.skip) && parseInt(query.limit)) {
        filterQuery['skip'] = (parseInt(query.skip) -1)*(parseInt(query.limit));
        filterQuery['limit'] = parseInt(query.limit);                
      }

      if (query.branch) {
        dbQuery['branch'] = query.branch;
      }

      let departmentList = await DEPARTMENT.find(dbQuery, "name organization creationDate branch", filterQuery)
                                          .populate("organization", "name")
                                          .populate("branch", "name");
      let total = await DEPARTMENT.countDocuments(dbQuery);

      return res.json({success: true, data: departmentList, messagee: "List Found", total: total});
    } else {
      return res.json({success: false, data:"", message: "Not Authorized to list department"});
    }
  } catch (err) {
    console.log("Error while creating organizatioin", err);
    return res.json({success: false, data:"", message: err});
  }
}

// Delete Department List
exports.deleteDepartment = async (req, res) => {
  try {
    let params = req.params;
    let proceed = await checkRole(req.user['role'], "canDeleteDepartment");
    
    if (proceed) {
      if (params.departmentId) {
        let query = {department: params.departmentId, softDelete: false};        
        let proceed  = await findOneSubdepartment(query);
        
        if (proceed) {
          return res.json({success: false, data: "", message: "Sub-Department linked with Department."});
        }
        
        proceed  = await findOneUser(query);
        
        if (proceed) {
          return res.json({success: false, data: "", message: "User linked with department."});
        }

        proceed  = await findOneCallLog(query);
        
        if (proceed) {
          return res.json({success: false, data: "", message: "Call Logs linked with department."});
        }

        await DEPARTMENT.findOneAndUpdate({_id: params.departmentId, softDelete: false},
                                            {"$set": {softDelete: true}});

        return res.json({success: true, data:"", message: "Department Deleted"});

      } else {
        return res.json({success: false, data: "", message: "Department Missing"});
      }
    } else {
      return res.json({success: false, data: "", message: "Not Authorized"});
    }
  } catch (err) {
    console.log("Error while deleting department", err);
    return res.json({success: false, data:"", message: err});
  }
}