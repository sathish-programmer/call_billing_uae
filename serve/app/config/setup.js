const ORG = require("../organization/organization.model");
const BRANCH = require("../branch/branch.model");
const ROLE = require("../role/role.model");
const USER = require("../user/user.model");
const INAIPI_ROLE_LIST = require("../role/role.const");
const _ = require("underscore");
const bcrypt = require("bcrypt");
var {SALT} = require("../../config");

async function setUpRootInformation() {
  try {
    // SETTING ORG
    let rootOrgData = { name: "INAIPI",
                        description : "Parent Org",
                        type: "root",
                        parent: null, softDelete: false }

    let orgData = await ORG.findOne(rootOrgData)
    if (!orgData) {
      rootOrgData['creationDate'] = new Date();
      let doc = new ORG(rootOrgData);
      orgData = await doc.save();        
    }              
    
    let orgId = orgData['_id'];

    // SETTING ROLE
    let rootRoleData = {name: "INAIPI - Role",
                        description : "Parent Org Role",
                        organization: orgId,
                        type: "root",
                        softDelete: false}

    let roleData = await ROLE.findOne(rootRoleData);

    if (!roleData) {
      rootRoleData['list'] = _.flatten(_.pluck(INAIPI_ROLE_LIST, "permissions"));
      let doc = new ROLE(rootRoleData);
      roleData = await doc.save()
    } else {
      let list = _.flatten(_.pluck(INAIPI_ROLE_LIST, "permissions"));
      roleData = await ROLE.findByIdAndUpdate({_id: roleData['_id']} , {"$set": {list: list}});
    }         
    
    let roleId = roleData['_id'];

    // SETTING USER
    let rootUserData = {firstName: "INAIPI", 
                        lastName: "Dubai", 
                        type: "root",
                        email : "admin@inaipi.com",
                        timeZone: "5fcca4b52b3f11d3081bc3be",
                        country: "5fcca4bc2b3f11d3081bc457",
                        department: "all",
                        password: bcrypt.hashSync("Imperium@123", SALT),
                        role: roleId, organization: orgId, branch: 'all',
                        softDelete: false, token : [], enableLogin: true};
              
    let userData = await USER.findOne({ email: "admin@inaipi.com", role: roleId,
                                        organization: orgId, branch: 'all', department:"all", type: "root",
                                        softDelete: false});

    if (!userData) {
      let doc = new USER(rootUserData);
      userData = await doc.save();
    }
    
    return  userData['_id'];

  } catch (error) {
    console.log("error in creating Parent Org, ROle, Branch, User", error);
    return '';
  }
}

setUpRootInformation();