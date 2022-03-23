const BRANCH = require("../branch/branch.model");
const ROLE = require("../role/role.model");
const DEPARTMENT = require("../department/department.model")
const SUB_DEPARTMENT = require("../sub-department/sub-department.model");
const USER = require("../user/user.model");
const ORGANIZATION = require("../organization/organization.model");
const TARIFF = require("../tariff/tariff.model");
const ASSIGN_TARIFF = require("../assign-tariff/assign-tariff.model");
const PROVIDER = require("../provider/provider.model");
const CALL_LOGS = require("../call-logs/call-logs.model");

let middleware = {
  findOneBranch : async (query) => {
    let data = await BRANCH.findOne(query);
    return data ? true : false;
  },
  findOneRole : async (query) => {
    let data = await ROLE.findOne(query);
    return data ? true : false;
  },
  findOneDepartment : async (query) => {
    let data = await DEPARTMENT.findOne(query);
    return data ? true : false;
  },
  findOneSubdepartment : async (query) => {
    let data = await SUB_DEPARTMENT.findOne(query);
    return data ? true : false;
  },
  findOneUser : async (query) => {
    let data = await USER.findOne(query);
    return data ? true : false;
  },
  findOneOrganization : async (query) => {
    let data = await ORGANIZATION.findOne(query);
    return data ? true : false;
  },
  findOneTariff : async (query) => {
    let data = await TARIFF.findOne(query);
    return data ? true: false;
  },
  findOneAssignTariff : async (query) => {
    let data = await ASSIGN_TARIFF.findOne(query);
    return data ? true: false;
  },
  findOneProvider : async (query) => {
    let data = await PROVIDER.findOne(query);
    return data ? true: false;
  },
  findOneCallLog: async (query) => {
    let data = await CALL_LOGS.findOne(query);
    return data ? true : false;
  }
}

module.exports =  middleware;