const SUB_DEPARTMENT = require("./sub-department.model");
const {checkRole} = require("../middleware");
const { findOneUser,
        findOneCallLog } = require("../dbConnection/dbQuery");

// Add su department List
exports.addSubDepartment = async (req, res) => {
  try {
    let proceed = await checkRole(req.user['role'], "canAddSubDepartment");

    if (proceed) {
      let body = req.body;

      if (body.name && body.name.toLowerCase().trim() == 'all') {
        return res.json({success: false, data: "", message: "Sub Department Name not allowed"});
      }

      if (body.name && body.organization && body.department) {
        if (await SUB_DEPARTMENT.findOne({name: body.name, organization: body.organization, department: body.department, softDelete: false})) {
          return res.json({success: false, data: "", message: "Sub Department already exists in same organization and department"});
        } else {
          let retDoc = new SUB_DEPARTMENT({ name: body.name,
                                            organization : body.organization,
                                            department: body.department,
                                            creationDate: new Date(),
                                            createdBy: req.user._id,
                                            softDelete: false});

          let doc = await retDoc.save();

          if (doc) {
            return res.json({success: true, data: doc['_id'], message: "Sub Department Added"});
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
    console.log("Error while creating sub department", err);
    return res.json({success: false, data:"", message: err});
  }
}

// Update Sub department functionality
exports.updateSubDepartment = async (req, res) => {
  try {
    let proceed = await checkRole(req.user['role'], "canUpdateSubDepartment");

    if (proceed) {
      let body = req.body;
      let params = req.params;

      if (body.name && body.name.toLowerCase().trim() == 'all') {
        return res.json({success: false, data: "", message: "Sub Department Name not allowed"});
      }

      if (body.name && params.subDepartmentId && body.organization && body.department) {
        if (await SUB_DEPARTMENT.findOne({name: body.name, department: body.department, 
                                          organization: body.organization, 
                                          _id: {"$ne": params.subDepartmentId}, 
                                          softDelete: false})) {
          return res.json({success: false, data: "", message: "Sub Department with same name already exists"});
        } else {
          let retDoc = await SUB_DEPARTMENT.findByIdAndUpdate({_id: params.subDepartmentId, softDelete: false}, 
                                                              {"$set": {name: body.name,
                                                                        department: body.department, 
                                                                        updationDate: new Date(),
                                                                        updatedBy: req.user._id}});

          if (retDoc) {
            return res.json({success: true, data: retDoc['_id'], message: "Sub Department Updated"});
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
    console.log("Error while updating sub department", err);
    return res.json({success: false, data:"", message: err});
  }
}

// Get Sub department List
exports.getSubDepartmentList = async (req, res) => {
  try {
    let proceed = await checkRole(req.user['role'], "canRetrieveSubDepartment");
    let params = req.params;
    let query = req.query;

    if (proceed) {
      let dbQuery = {organization: params.orgId, softDelete: false};
      let filterQuery = {"sort": {"creationDate":-1}};

      if (query.department) {
        dbQuery['department'] = query.department;
      }
      
      if (parseInt(query.skip) && parseInt(query.limit)) {
        filterQuery['skip'] = (parseInt(query.skip) -1)*(parseInt(query.limit));
        filterQuery['limit'] = parseInt(query.limit);                
      }

      let subDepartmentList = await SUB_DEPARTMENT.find(dbQuery, "name organization creationDate department", filterQuery)
                                          .populate("organization", "name")
                                          .populate("department", "name");
      let total = await SUB_DEPARTMENT.countDocuments(dbQuery);

      return res.json({success: true, data: subDepartmentList, messagee: "List Found", total: total});                            
    } else {
      return res.json({success: false, data:"", message: "Not Authorized to list sub department"});
    }
  } catch (err) {
    console.log("Error while creating sub department", err);
    return res.json({success: false, data:"", message: err});
  }
}

// Delete Sub department
exports.deleteSubDepartment = async (req, res) => {
  try {
    let params = req.params;
    let proceed = await checkRole(req.user['role'], "canDeleteSubDepartment");
    
    if (proceed) {
      if (params.subDepartmentId) {
        let query = {subdepartment: params.subDepartmentId, softDelete: false};      
        let proceed = await findOneUser(query);
        
        if (proceed) {
          return res.json({success: false, data: "", message: "User linked with sub department."});
        }

        proceed = await findOneCallLog(query);
        
        if (proceed) {
          return res.json({success: false, data: "", message: "Call Logs linked with sub department."});
        }

        await SUB_DEPARTMENT.findOneAndUpdate({_id: params.subDepartmentId, softDelete: false},
                                              {"$set": {softDelete: true}});

        return res.json({success: true, data:"", message: "Organization Deleted"});

      } else {
        return res.json({success: false, data: "", message: "Organization Missing"});
      }
    } else {
      return res.json({success: false, data: "", message: "Not Authorized"});
    }
  } catch (err) {
    console.log("Error while deleting organization", err);
    return res.json({success: false, data:"", message: err});
  }
}