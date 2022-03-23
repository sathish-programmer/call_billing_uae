const ROLE = require("./role.model");
const INAIPI_ROLE_LIST = require("./role.const");
const {checkRole} = require("../middleware");
const { findOneUser } = require("../dbConnection/dbQuery");

// Get Role For Single User
exports.getRole = async (req, res) => {
  try {
    if (req.user.role) {
      let retDoc = await ROLE.findOne({_id: req.user.role, organization: req.user.organization,
                                        softDelete: false}, "list");

      if (retDoc) {
        return res.json({success: true, data: retDoc, message: "Role Fetched"});
      } else {
        return res.json({success: false, data: {}, message: "Something went wrong"});
      }

    } else {
      return res.json({success: false, data:"", message: "Missing data"});
    }
  } catch (err) {
    console.log("Error while fetching role", err);
    return res.json({success: false, data:"", message: err});
  }
}

// Add Role for the Organization
exports.addRole = async (req, res) => {
  try {
    let body = req.body;
    let proceed = await checkRole(req.user['role'], "canAddRole");
    if (proceed) {
      if (body.name && body.list && body.list.length && body.organization) {
        if (await ROLE.findOne({name: body.name, organization: body.organization, softDelete: false})) {
          return res.json({success: false, data: "", message: "Role with same name already exists"});
        } else {
          let docToSave = new ROLE({name: body.name,
                                    list: body.list,
                                    organization: body.organization,
                                    description: body.description || '',
                                    type: 'normal',
                                    creationDate: new Date(),
                                    createdBy: req.user._id,
                                    softDelete: false});
                            
          let retDoc = await docToSave.save();

          if (retDoc) {
            return res.json({success: true, data: retDoc['_id'], message: "Role Added"});
          } else {
            return res.json({success: false, data: '', message: "Something went wrong"});
          }
        }
      } else {
        return res.json({success: false, data:"", message: "Missing data"});
      }
    } else {
      return res.json({success: false, data: "", message: "Not Authorized"});
    }
  } catch (err) {
    console.log("Error while creating role", err);
    return res.json({success: false, data:"", message: err});
  }
}

// Add Role for the Organization 3rd party app
exports.addRole_v2 = async (req, res) => {
  try {
    let body = req.body;
    let proceed = await checkRole(req.user['role'], "canAddRole");
    let List = [
          "canSeeCallLogsDashboard",
          "canSeeReports",
          "canAddRole",
          "canEditRole",
          "canDeleteRole",
          "canRetrieveRole",
          "canAddUser",
          "canEditUser",
          "canDeleteUser",
          "canRetrieveUser",
          "canUpdateUserPassword",
          "canAddSubDepartment",
          "canRetrieveSubDepartment",
          "canUpdateSubDepartment",
          "canDeleteSubDepartment",
          "canAddDepartment",
          "canRetrieveDepartment",
          "canUpdateDepartment",
          "canDeleteDepartment",
          "canAddBranch",
          "canRetrieveBranch",
          "canUpdateBranch",
          "canDeleteBranch"
      ];
    if (proceed) {
      if (body.name && body.organization) {
        if (await ROLE.findOne({name: body.name, organization: body.organization, softDelete: false})) {
          return res.json({success: false, data: "", message: "Role with same name already exists"});
        } else {
          let docToSave = new ROLE({name: body.name,
                                    list: List,
                                    organization: body.organization,
                                    description: body.description || '',
                                    type: 'normal',
                                    creationDate: new Date(),
                                    createdBy: req.user._id,
                                    softDelete: false});
                            
          let retDoc = await docToSave.save();

          if (retDoc) {
            return res.json({success: true, data: retDoc['_id'], message: "Role Added"});
          } else {
            return res.json({success: false, data: '', message: "Something went wrong"});
          }
        }
      } else {
        return res.json({success: false, data:"", message: "Missing data"});
      }
    } else {
      return res.json({success: false, data: "", message: "Not Authorized"});
    }
  } catch (err) {
    console.log("Error while creating role", err);
    return res.json({success: false, data:"", message: err});
  }
}

// Update Role for the Organization 3rd party app
exports.updateRole_v2 = async (req, res) => {
  try {
    let body = req.body;
    let params = req.params;
    let proceed = await checkRole(req.user['role'], "canEditRole");
    let List = [
      "canSeeCallLogsDashboard",
      "canSeeReports",
      "canAddRole",
      "canEditRole",
      "canDeleteRole",
      "canRetrieveRole",
      "canAddUser",
      "canEditUser",
      "canDeleteUser",
      "canRetrieveUser",
      "canUpdateUserPassword",
      "canAddSubDepartment",
      "canRetrieveSubDepartment",
      "canUpdateSubDepartment",
      "canDeleteSubDepartment",
      "canAddDepartment",
      "canRetrieveDepartment",
      "canUpdateDepartment",
      "canDeleteDepartment",
      "canAddBranch",
      "canRetrieveBranch",
      "canUpdateBranch",
      "canDeleteBranch"
  ];
    if (proceed) {
      if (body.name, List && List.length && body.organization && params.roleId) {
        if (await ROLE.findOne({name: body.name, organization: body.organization, 
                                softDelete: false, _id: {"$ne": params.roleId}})) {
          return res.json({success: false, data: "", message: "Role with same name already exists"});
        } else {
          let retDoc = await ROLE.findByIdAndUpdate({_id: params.roleId, softDelete: false, type: 'normal'}, 
                                                    {"$set": {name: body.name,
                                                              list: List,
                                                              organization: body.organization,
                                                              description: body.description || '',
                                                              updationDate: new Date(),
                                                              updatedBy: req.user._id,
                                                            }});
                            
          if (retDoc) {
            return res.json({success: true, data: retDoc['_id'], message: "Role Updated"});
          } else {
            return res.json({success: false, data: '', message: "Something went wrong"});
          }
        }
      } else {
        return res.json({success: false, data:"", message: "Missing data"});
      }
    } else {
      return res.json({success: false, data: "", message: "Not Authorized"});
    }
  } catch (err) {
    console.log("Error while updating role", err);
    return res.json({success: false, data:"", message: err});
  }
}


// Update Role
exports.updateRole = async (req, res) => {
  try {
    let body = req.body;
    let params = req.params;
    let proceed = await checkRole(req.user['role'], "canEditRole");

    if (proceed) {
      if (body.name, body.list && body.list.length && body.organization && params.roleId) {
        if (await ROLE.findOne({name: body.name, organization: body.organization, 
                                softDelete: false, _id: {"$ne": params.roleId}})) {
          return res.json({success: false, data: "", message: "Role with same name already exists"});
        } else {
          let retDoc = await ROLE.findByIdAndUpdate({_id: params.roleId, softDelete: false, type: 'normal'}, 
                                                    {"$set": {name: body.name,
                                                              list: body.list,
                                                              organization: body.organization,
                                                              description: body.description || '',
                                                              updationDate: new Date(),
                                                              updatedBy: req.user._id,
                                                            }});
                            
          if (retDoc) {
            return res.json({success: true, data: retDoc['_id'], message: "Role Updated"});
          } else {
            return res.json({success: false, data: '', message: "Something went wrong"});
          }
        }
      } else {
        return res.json({success: false, data:"", message: "Missing data"});
      }
    } else {
      return res.json({success: false, data: "", message: "Not Authorized"});
    }
  } catch (err) {
    console.log("Error while updating role", err);
    return res.json({success: false, data:"", message: err});
  }
}

// Get Role List
exports.getRoles = async (req, res) => {
  try {
    let params = req.params;
    let proceed = await checkRole(req.user['role'], 'canRetrieveRole');
    let query = req.query;

    if (proceed) {
      if (params.orgId) {
        let roleQuery = {organization: params.orgId, softDelete: false, type: 'normal'};
        let filterQuery = {"sort": {"creationDate":-1}};

        if (parseInt(query.skip) && parseInt(query.limit)) {
          filterQuery['skip'] = (parseInt(query.skip) -1)*(parseInt(query.limit));
          filterQuery['limit'] = parseInt(query.limit);                
        }

        let roles = await ROLE.find(roleQuery, '', filterQuery)
                              .populate("organization", "name");
        let total = await ROLE.countDocuments(roleQuery);

        return res.json({success: true, data: roles, message: "Roles List", total: total});
      } else {
        return res.json({success: false, data:"", message: "Organization Missing"});
      }
    } else {
      return res.json({success: false, data:"", message: "Not Authorized"});
    }
  } catch (err) {
    console.log("Error while fetching roles", err);
    return res.json({success: false, data: "", message: err});
  }
}

// Get Single role for the Edit page
exports.getSingleRole = async (req, res) => {
  try {
    let params = req.params;
    let proceed = await checkRole(req.user['role'], 'canEditRole');
    
    if (proceed) {
      if (params.orgId && params.roleId) {
        let role = await ROLE.findOne({ _id: params.roleId, organization: params.orgId,
                                         softDelete: false, type: 'normal'});

        if (role) {
          return res.json({success: true, data: role, message: "Fetched Role"});
        } else {
          return res.json({success: false, data: {}, message: "Something went wrong"});
        }
      } else {
        return res.json({success: false, data:"", message: "Organization Miissing"});
      }
    } else {
      return res.json({success: false, data:"", message: "Not Authorized"});
    }
  } catch (err) {
    console.log("Error while fetching roles", err);
    return res.json({success: false, data: "", message: err});
  }
}

// Fetch Master Role List
exports.fetchMasterRoleList = async (req, res) => {
  try {
    return res.json({success: true, data:  INAIPI_ROLE_LIST, message: "Master Role List"});
  } catch (err) {
    return res.json({success: false,data: "", message: err});
  }
}

// Delete Role, if not assigned with user
exports.deleteRole = async (req, res) => {
  try {
    let params = req.params;
    let proceed = await checkRole(req.user['role'], "canDeleteRole");
    
    if (proceed) {
      if (params.roleId) {
        let proceed  = await findOneUser({role: params.roleId, softDelete: false});
        
        if (proceed) {
          return res.json({success: false, data: "", message: "Role linked with User."});
        }

        await ROLE.findOneAndUpdate({_id: params.roleId, softDelete: false, type: 'normal'}, 
                                    {"$set": {softDelete: true}});

        return res.json({success: true, data:"", message: "Role Deleted"});
      } else {
        return res.json({success: false, data: "", message: "Role Id is Missing"});
      }
    } else {
      return res.json({success: false, data: "", message: "Not Authorized"});
    }
  } catch (err) {
    console.log("Error while deleting role", err);
    return res.json({success: false, data:"", message: err});
  }
}