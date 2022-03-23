const ASSIGN_TARIFF = require("./assign-tariff.model");
const { checkRole } = require("../middleware");

/* Assign the Provider with the Branch
 */
exports.assignTariff = async (req, res) => {
  try {
    let proceed = await checkRole(req.user["role"], "canAddAssignTariff");
    if (proceed) {
      let body = req.body;

      if (body.organization && body.branch && body.provider) {
        if (
          await ASSIGN_TARIFF.findOne({
            organization: body.organization,
            branch: body.branch,
            provider: body.provider,
            softDelete: false,
          })
        ) {
          return res.json({
            success: false,
            data: "",
            message: "Tariff already assigned",
          });
        } else {
          let retDoc = new ASSIGN_TARIFF({
            organization: body.organization,
            branch: body.branch,
            provider: body.provider,
            description: body.description || "",
            creationDate: new Date(),
            createdBy: req.user._id,
            softDelete: false,
          });

          let doc = await retDoc.save();

          if (doc) {
            return res.json({
              success: true,
              data: doc["_id"],
              message: "Tariff Assigned",
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
    console.log("Error while assigning ", err);
    return res.json({ success: false, data: "", message: err });
  }
};

// Update the Assign Tariff
exports.updateAssignTariff = async (req, res) => {
  try {
    let proceed = await checkRole(req.user["role"], "canEditAssignTariff");

    if (proceed) {
      let body = req.body;
      let params = req.params;

      if (
        body.organization &&
        body.branch &&
        body.provider &&
        params.assignTariffId
      ) {
        if (
          await ASSIGN_TARIFF.findOne({
            organization: body.organization,
            branch: body.branch,
            provider: body.provider,
            _id: { $ne: params.assignTariffId },
            softDelete: false,
          })
        ) {
          return res.json({
            success: false,
            data: "",
            message: "Tariff Already assigned",
          });
        } else {
          let retDoc = await ASSIGN_TARIFF.findByIdAndUpdate(
            { _id: params.assignTariffId, softDelete: false },
            {
              $set: {
                organization: body.organization,
                branch: body.branch,
                provider: body.provider,
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
              message: "Tariff assigned updated",
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
    console.log("Error while updating assigned tariff", err);
    return res.json({ success: false, data: "", message: err });
  }
};

// Get the List of Assign Tariff for the List view
exports.getAssignedTariffList = async (req, res) => {
  try {
    let proceed = await checkRole(req.user["role"], "canRetrieveAssignTariff");
    let params = req.params;
    let query = req.query;

    if (proceed && params.orgId) {
      let assignTariffQuery = { organization: params.orgId, softDelete: false };
      let filterQuery = { sort: { creationDate: -1 } };

      if (parseInt(query.skip) && parseInt(query.limit)) {
        filterQuery["skip"] =
          (parseInt(query.skip) - 1) * parseInt(query.limit);
        filterQuery["limit"] = parseInt(query.limit);
      }

      let retDoc = await ASSIGN_TARIFF.find(assignTariffQuery, "", filterQuery)
        .populate("branch", "name")
        .populate("provider", "name");
      let total = await ASSIGN_TARIFF.countDocuments(assignTariffQuery);

      return res.json({
        success: true,
        data: retDoc,
        message: "List Found",
        total: total,
      });
    } else {
      return res.json({ success: false, data: "", message: "Not Authorized" });
    }
  } catch (err) {
    console.log("Error while retrieving assigned Tariff list", err);
    return res.json({ success: false, data: "", message: err });
  }
};

// Delete AssignedTariff List
exports.deleteAssignedTariff = async (req, res) => {
  try {
    let params = req.params;
    let proceed = await checkRole(req.user["role"], "canEditAssignTariff");

    if (proceed) {
      if (params.assignTariffId) {
        let query = { provider: params.assignTariffId, softDelete: false };
        // let proceed = await findOneTariff(query);

        // if (proceed) {
        //   return res.json({
        //     success: false,
        //     data: "",
        //     message: "Tariff linked with provider.",
        //   });
        // }

        // proceed = await findOneAssignTariff(query);

        // if (proceed) {
        //   return res.json({
        //     success: false,
        //     data: "",
        //     message: "Assign Tariff linked with provider.",
        //   });
        // }

        await ASSIGN_TARIFF.findOneAndUpdate(
          { _id: params.assignTariffId, softDelete: false },
          { $set: { softDelete: true } }
        );

        return res.json({
          success: true,
          data: "",
          message: "Assigned Tariff Deleted",
        });
      } else {
        return res.json({
          success: false,
          data: "",
          message: "Provider Missing",
        });
      }
    } else {
      return res.json({ success: false, data: "", message: "Not Authorized" });
    }
  } catch (err) {
    console.log("Error while deleting Assigned Tariff", err);
    return res.json({ success: false, data: "", message: err });
  }
};
