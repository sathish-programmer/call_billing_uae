const ORG = require("./organization.model");
const DP_USER = require("../user/dp-user.model");
const { SALT } = require("../../config");
const { checkRole } = require("../middleware");
const {
  findOneBranch,
  findOneDepartment,
  findOneRole,
  findOneSubdepartment,
  findOneUser,
  findOneOrganization,
  findOneAssignTariff,
  findOneProvider,
  findOneTariff,
  findOneCallLog,
} = require("../dbConnection/dbQuery");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// Create Organization functionalit
exports.createOrganization = async (req, res) => {
  try {
    let proceed = await checkRole(req.user["role"], "canAddOrganization");

    if (proceed) {
      let body = req.body;

      if (body.name && body.parent) {
        if (await ORG.findOne({ name: body.name, softDelete: false })) {
          return res.json({
            success: false,
            data: "",
            message: "Organization with same name already exists",
          });
        } else {
          let retDoc = new ORG({
            name: body.name,
            description: body.description || "",
            parent: body.parent,
            type: "normal",
            creationDate: new Date(),
            createdBy: req.user._id,
            softDelete: false,
          });

          let doc = await retDoc.save();

          // Create Data Provider user for the organization
          let dpUserDoc = new DP_USER({
            firstName: body.name,
            lastName: "DP",
            organization: doc["_id"],
            email: "dp." + body.name.toLowerCase().trim() + "@inaipi.com",
            password: bcrypt.hashSync("dp@123!", SALT),
            token: [],
            type: "dp",
            enableLogin: true,
            softDelete: false,
          });

          await dpUserDoc.save();

          if (doc) {
            return res.json({
              success: true,
              data: doc["_id"],
              message: "Organization Added",
            });
          } else {
            return res.json({
              success: false,
              data: "",
              message: "Something went wrong",
            });
          }
        }
      } else {
        return res.json({ success: false, data: "", message: "Missing data" });
      }
    } else {
      return res.json({ success: false, data: "", message: "Not Authorized" });
    }
  } catch (err) {
    console.log("Error while creating organizatioin", err);
    return res.json({ success: false, data: "", message: err });
  }
};

// Get Organization list for the top right drop down
exports.getOrganizationListForDropDown = async (req, res) => {
  try {
    let proceed = await checkRole(req.user["role"], "canRetrieveOrganization");

    if (proceed) {
      proceed = await checkRole(req.user["role"], "canSeeAllChildOrganization");

      if (proceed) {
        let aggregateQuery = [
          { $match: { _id: mongoose.Types.ObjectId(req.user.organization) } },
          {
            $graphLookup: {
              from: "organizations",
              startWith: "$_id",
              connectFromField: "_id",
              connectToField: "parent",
              as: "orgList",
              restrictSearchWithMatch: { softDelete: false },
            },
          },
        ];

        let retDoc = await ORG.aggregate(aggregateQuery);
        let orgList = [];

        if (retDoc && retDoc.length) {
          function minimizedTree(treeFile) {
            orgList.push({ name: treeFile["name"], _id: treeFile["_id"] });
            if (treeFile.orgList && treeFile.orgList)
              treeFile.orgList.map(minimizedTree);
            return orgList;
          }

          minimizedTree(retDoc[0]);
        }

        return res.json({
          success: true,
          data: orgList,
          messagee: "List Found",
        });
      } else {
        let retDoc = await ORG.findOne(
          { _id: req.user.organization, softDelete: false },
          "name creationDate"
        ).lean();
        retDoc["child"] = [];

        return res.json({
          success: true,
          data: [retDoc],
          messagee: "List Found",
        });
      }
    } else {
      let retDoc = await ORG.findOne(
        { _id: req.user.organization, softDelete: false },
        "name creationDate"
      ).lean();
      retDoc["child"] = [];

      return res.json({
        success: true,
        data: [retDoc],
        messagee: "List Found",
      });
      // return res.json({success: false, data:"", message: "Not Authorized to list organization"});
    }
  } catch (err) {
    console.log("Error while creating organizatioin", err);
    return res.json({ success: false, data: "", message: err });
  }
};

// Update Organization only name is allowed dto update
exports.updateOrganization = async (req, res) => {
  try {
    let proceed = await checkRole(req.user["role"], "canEditOrganization");

    if (proceed) {
      let body = req.body;
      let params = req.params;

      if (body.name && params.orgId) {
        if (
          await ORG.findOne({
            name: body.name,
            _id: { $ne: params.orgId },
            softDelete: false,
          })
        ) {
          return res.json({
            success: false,
            data: "",
            message: "Organization with same name already exists",
          });
        } else {
          let retDoc = await ORG.findByIdAndUpdate(
            { _id: params.orgId, softDelete: false, type: "normal" },
            {
              $set: {
                name: body.name,
                description: body.description || "",
                updationDate: new Date(),
                updatedBy: req.user._id,
              },
            }
          );

          if (retDoc) {
            return res.json({
              success: true,
              data: retDoc["_id"],
              message: "Organization Updated",
            });
          } else {
            return res.json({
              success: false,
              data: "",
              message: "Something went wrong",
            });
          }
        }
      } else {
        return res.json({ success: false, data: "", message: "Missing data" });
      }
    } else {
      return res.json({ success: false, data: "", message: "Not Authorized" });
    }
  } catch (err) {
    console.log("Error while updating organizatioin", err);
    return res.json({ success: false, data: "", message: err });
  }
};

// Get Organization list for the Organization view page
// This also calculaete the number of childs that particular organization have
exports.getOrganizationList = async (req, res) => {
  try {
    let proceed = await checkRole(req.user["role"], "canRetrieveOrganization");

    if (proceed) {
      proceed = await checkRole(req.user["role"], "canSeeAllChildOrganization");

      if (proceed) {
        let aggregateQuery = [
          { $match: { _id: mongoose.Types.ObjectId(req.user.organization) } },
          {
            $graphLookup: {
              from: "organizations",
              startWith: "$_id",
              connectFromField: "_id",
              connectToField: "parent",
              as: "orgList",
              restrictSearchWithMatch: { softDelete: false },
            },
          },
        ];

        let retDoc = await ORG.aggregate(aggregateQuery);
        let orgList = [];

        if (retDoc && retDoc.length) {
          function minimizedTree(treeFile) {
            orgList.push({
              name: treeFile["name"],
              _id: treeFile["_id"],
              parent: treeFile.parent,
              description: treeFile.description,
              creationDate: treeFile.creationDate,
            });

            if (treeFile.orgList && treeFile.orgList)
              treeFile.orgList.map(minimizedTree);
            return orgList;
          }

          minimizedTree(retDoc[0]);
        }

        for (let index in orgList) {
          orgList[index]["child"] = await ORG.find({
            softDelete: false,
            parent: orgList[index]["_id"],
          });
          orgList[index]["parentName"] = "";

          if (orgList[index]["parent"]) {
            let org = await ORG.findOne({
              softDelete: false,
              _id: orgList[index]["parent"],
            });

            if (org) {
              orgList[index]["parentName"] = org.name;
            }
          }
        }

        return res.json({
          success: true,
          data: orgList,
          messagee: "List Found",
        });
      } else {
        let retDoc = await ORG.findOne(
          { _id: req.user.organization, softDelete: false },
          "name description creationDate parent"
        ).lean();

        if (retDoc) {
          let org = await ORG.findOne({
            softDelete: false,
            _id: retDoc["parent"],
          });

          if (org) {
            retDoc["parentName"] = org.name;
          }
        }
        retDoc["child"] = [];

        return res.json({
          success: true,
          data: [retDoc],
          messagee: "List Found",
        });
      }
    } else {
      return res.json({
        success: false,
        data: "",
        message: "Not Authorized to list organization",
      });
    }
  } catch (err) {
    console.log("Error while creating organizatioin", err);
    return res.json({ success: false, data: "", message: err });
  }
};

// Delete Organization, if not linked anywhere
exports.deleteOrganiztion = async (req, res) => {
  try {
    let params = req.params;
    let proceed = await checkRole(req.user["role"], "canDeleteOrganization");

    if (proceed) {
      if (params.orgId) {
        let query = { organization: params.orgId, softDelete: false };
        let proceed = await findOneOrganization({
          parent: params.orgId,
          softDelete: false,
        });

        if (proceed) {
          return res.json({
            success: false,
            data: "",
            message: "Child Organization exists",
          });
        }

        proceed = await findOneBranch(query);

        if (proceed) {
          return res.json({
            success: false,
            data: "",
            message: "Branch linked with organization.",
          });
        }

        proceed = await findOneDepartment(query);

        if (proceed) {
          return res.json({
            success: false,
            data: "",
            message: "Department linked with organization.",
          });
        }

        proceed = await findOneSubdepartment(query);

        if (proceed) {
          return res.json({
            success: false,
            data: "",
            message: "Sub-Department linked with organization.",
          });
        }

        proceed = await findOneRole(query);

        if (proceed) {
          return res.json({
            success: false,
            data: "",
            message: "Role linked with organization.",
          });
        }

        proceed = await findOneUser(query);

        if (proceed) {
          return res.json({
            success: false,
            data: "",
            message: "User linked with organization.",
          });
        }

        proceed = await findOneProvider(query);

        if (proceed) {
          return res.json({
            success: false,
            data: "",
            message: "Provider linked with organization.",
          });
        }

        proceed = await findOneTariff(query);

        if (proceed) {
          return res.json({
            success: false,
            data: "",
            message: "Tariff linked with organization.",
          });
        }

        proceed = await findOneAssignTariff(query);

        if (proceed) {
          return res.json({
            success: false,
            data: "",
            message: "Assign Tariff linked with organization.",
          });
        }

        proceed = await findOneCallLog(query);

        if (proceed) {
          return res.json({
            success: false,
            data: "",
            message: "Call Logs linked with organization.",
          });
        }

        await ORG.findOneAndUpdate(
          { _id: params.orgId, softDelete: false, type: "normal" },
          { $set: { softDelete: true } }
        );

        return res.json({
          success: true,
          data: "",
          message: "Organization Deleted",
        });
      } else {
        return res.json({
          success: false,
          data: "",
          message: "Organization Missing",
        });
      }
    } else {
      return res.json({ success: false, data: "", message: "Not Authorized" });
    }
  } catch (err) {
    console.log("Error while deleting organization", err);
    return res.json({ success: false, data: "", message: err });
  }
};
