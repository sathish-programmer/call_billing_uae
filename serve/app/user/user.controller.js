const USER = require("./user.model");
const DP_USER = require("./dp-user.model");
const BRANCH = require("../branch/branch.model");
const DEPARTMENT = require("../department/department.model");
const bcrypt = require('bcrypt');
const {SALT} = require("../../config");
const {checkRole} = require("../middleware");
const { findOneCallLog } = require("../dbConnection/dbQuery");
const jwt = require('jsonwebtoken');
var {OAUTH_SECRET} = require("../../config");

// Add user in the system
exports.addUser = async (req, res) => {
  try {
    let body = req.body;
    let proceed = await checkRole(req.user['role'], "canAddUser");

    if (proceed) {
      if (body.firstName && body.lastName && body.password && body.email 
          && body.country && body.timeZone && body.organization && body.branch && body.role) {
        if (await USER.findOne({name: body.email, organization: body.organization, softDelete: false})) {
          return res.json({success: false, data: "", message: "User with same email already exists"});
        } else {
          let userObject  = { firstName: body.firstName,
                              lastName: body.lastName,
                              organization: body.organization,
                              email: body.email,
                              password: bcrypt.hashSync(body.password, SALT),
                              country : body.country,
                              role: body.role,
                              branch: body.branch,
                              timeZone: body.timeZone,
                              department: body.department,
                              extension: body.extension || '',                        
                              token : [],
                              type: 'normal',
                              loginType: 'normal',
                              enableLogin: body.enableLogin,
                              creationDate: new Date(),
                              creationBy: req.user._id,
                              softDelete: false};

          if (body['subdepartment']) {
            userObject['subdepartment'] = body['subdepartment'];
          }

          let docToSave = new USER(userObject);                            
          let retDoc = await docToSave.save();

          if (retDoc) {
            return res.json({success: true, data: retDoc['_id'], message: "User Added"});
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
    console.log("Error while creating user", err);
    return res.json({success: false, data:"", message: err});
  }
}

// Add user in the system for 3rd party
exports.addUserV2 = async (req, res) => {
  try {
    let body = req.body;
    let proceed = await checkRole(req.user['role'], "canAddUser");

    if (proceed) {
      if (body.firstName && body.lastName && body.password && body.email 
          && body.country && body.timeZone && body.organization && body.branch && body.role) {
        if (await USER.findOne({name: body.email, organization: body.organization, softDelete: false})) {
          return res.json({success: false, data: "", message: "User with same email already exists"});
        } else {
          let userObject  = { firstName: body.firstName,
                              lastName: body.lastName,
                              organization: body.organization,
                              email: body.email,
                              password: bcrypt.hashSync(body.password, SALT),
                              country : body.country,
                              role: body.role,
                              branch: body.branch,
                              timeZone: body.timeZone,
                              department: body.department,
                              extension: body.extension || '',                        
                              token : [],
                              type: 'normal',
                              loginType: 'fromWeb',
                              enableLogin: body.enableLogin,
                              creationDate: new Date(),
                              creationBy: req.user._id,
                              softDelete: false};

          if (body['subdepartment']) {
            userObject['subdepartment'] = body['subdepartment'];
          }

          let docToSave = new USER(userObject);                            
          let retDoc = await docToSave.save();

          if (retDoc) {
            return res.json({success: true, data: retDoc['_id'], message: "User Added"});
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
    console.log("Error while creating user", err);
    return res.json({success: false, data:"", message: err});
  }
}

// Update User
exports.updateUser = async (req, res) => {
  try {
    let body = req.body;
    let params = req.params;
    let proceed = await checkRole(req.user['role'], "canEditUser");

    if (proceed) {
      if (body.firstName && body.lastName && body.email && params.userId
            && body.country && body.timeZone && body.organization && body.branch && body.role) {
        if (await USER.findOne({email: body.email, organization: body.organization, 
                                softDelete: false, _id: {"$ne": params.userId}})) {
          return res.json({success: false, data: "", message: "User with same email already exists"});
        } else {
          let userObject = {firstName: body.firstName,
                            lastName: body.lastName,
                            country : body.country,
                            organization: body.organization,
                            role: body.role,
                            branch: body.branch,
                            extension: body.extension || '',
                            timeZone: body.timeZone,
                            enableLogin: body.enableLogin,
                            department: body.department,
                            updationDate: new Date(),
                            updatedBy: req.user._id};

          if (body['subdepartment']) {
            userObject['subdepartment'] = body['subdepartment'];
          }

          let retDoc = await USER.findByIdAndUpdate({_id: params.userId, softDelete: false, type: 'normal'}, 
                                                    {"$set": userObject});
                            
          if (retDoc) {
            return res.json({success: true, data: retDoc['_id'], message: "User Updated"});
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
    console.log("Error while updating user", err);
    return res.json({success: false, data:"", message: err});
  }
}

// Get User List for list view
exports.getUsers = async (req, res) => {
  try {
    let params = req.params;
    let query = req.query;
    let proceed = await checkRole(req.user['role'], 'canRetrieveUser');
    
    if (proceed) {
      if (params.orgId) {
        let userQuery = {organization: params.orgId, softDelete: false, type: 'normal'};
        let filterQuery = {"sort": {"creationDate":-1}};

        if (parseInt(query.skip) && parseInt(query.limit)) {
          filterQuery['skip'] = (parseInt(query.skip) -1)*(parseInt(query.limit));
          filterQuery['limit'] = parseInt(query.limit);                
        }

        let users = await USER.find(userQuery, '', filterQuery)
                              .populate("organization", "name")
                              .populate("timeZone", "completeName")
                              .populate("country", "nameCommon")
                              .populate("role", "name").lean();
        let total = await USER.countDocuments(userQuery);

        for (let index in users) {
          if (users[index]['branch'] != 'all')  {
            users[index]['branchName'] = '';

            let branch = await BRANCH.findOne({_id: users[index]['branch']}, "name");

            if (branch) {
              users[index]['branchName'] = branch['name'];
            }
          } else {
            users[index]['branchName'] = 'All';
          }

          if (users[index]['department'] != 'all')  {
            users[index]['departmentName'] = '';

            let department = await DEPARTMENT.findOne({_id: users[index]['department']}, "name");

            if (department) {
              users[index]['departmentName'] = department['name'];
            }
          } else {
            users[index]['departmentName'] = 'All';
          }
        }

        return res.json({success: true, data: users, message: "User List", total: total});
      } else {
        return res.json({success: false, data:"", message: "Organization Missing"});
      }
    } else {
      return res.json({success: false, data:"", message: "Not Authorized"});
    }
  } catch (err) {
    console.log("Error while fetching users", err);
    return res.json({success: false, data: "", message: err});
  }
}

exports.updateUserPassword = async(req, res) => {
  try {
    let params = req.params;
    let proceed = await checkRole(req.user['role'], 'canUpdateUserPassword');

    if (params.currentPassword && params.newPassword) {

    }
  } catch (err) {
    return res.json({success: false, data: "", message: err});
  }
}

// Delete User from the system
exports.deleteUser = async (req, res) => {
  try {
    let params = req.params;
    let proceed = await checkRole(req.user['role'], "canDeleteUser");
    
    if (proceed) {
      if (params.userId) {
        let query = {user: params.userId, softDelete: false};
        let proceed  = await findOneCallLog(query);
        
        if (proceed) {
          return res.json({success: false, data: "", message: "Call Logs linked with user."});
        }

        await USER.findOneAndUpdate({_id: params.userId, softDelete: false, type: 'normal'},
                                    {"$set": {softDelete: true}});

        return res.json({success: true, data:"", message: "User Deleted"});

      } else {
        return res.json({success: false, data: "", message: "User Missing"});
      }
    } else {
      return res.json({success: false, data: "", message: "Not Authorized"});
    }
  } catch (err) {
    console.log("Error while deleting user", err);
    return res.json({success: false, data:"", message: err});
  }
}

// Create Token for the DP User
exports.createTokenForDpUser = async (req, res) => {
  try {
    let user = req.user;
    let params = req.params;

    if (user && user.type == 'root') {
      if (params && params.userId) {
        let userDoc = await DP_USER.findOne({_id: params.userId, softDelete: false});

        if (userDoc) {
          let token = jwt.sign({_id: userDoc['_id'], email: userDoc.email}, OAUTH_SECRET);
          let tokenArray = [];

          if (userDoc.token && userDoc.token.length) {
            tokenArray = userDoc.token;
          }

          tokenArray.push(token);    
          await DP_USER.findByIdAndUpdate({_id: userDoc['_id'], softDelete: false}, {"$set": {token: tokenArray}});

          return res.json({ success: true, message: "Created user token", data: token});
        } else {
          return res.json({success: false, data: "", message: "User Not found"});
        }
      } else {
        return res.json({success: false, data: "", message: "User Id not passed"});
      } 
    } else {
      return res.json({success: false, data:"", message: "Not Authorized to create token"});
    }    
  } catch (err) {
    console.log("Error while deleting user", err);
    return res.json({success: false, data:"", message: err});
  }
}

// Get DP Users List, right now it is only one becayse there is no manual creation of 
// DP user. it gets created when Organization is created
exports.getDPUsers = async (req, res) => {
  try {
    let params = req.params;

    if (params && params.orgId) {
      let dpUserList = await DP_USER.find({organization: params.orgId, softDelete: false});
      return res.json({success: true, data: dpUserList, message: "User List"});
    } else {
      return res.json({sucess: false, data:"", message: "Organization is required"});
    }
  } catch (err) {
    console.log("Error while fetching dp users", err);
    return res.json({success: false, data: "", message: err});
  }
}