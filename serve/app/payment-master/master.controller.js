<<<<<<< HEAD
const MASTER = require("./master.model");
const CURRENCY = require("../currency/currency.model");
// add package
exports.addpackage = async (req, res) => {
  try {
    let body = req.body;
    let currency = body.currency;

    let packageAmount = body.packageVal;

    let findCurrency = await CURRENCY.findOne(
      {
        _id: currency,
      },
      "symbol"
    );
    let currencySymbol;

    if (findCurrency) {
      currencySymbol = findCurrency["symbol"];
    }

    if (
      await MASTER.findOne({
        packageAmount: packageAmount,
        currency: currency,
        softDelete: false,
      })
    ) {
      let findCurrency = await CURRENCY.findOne(
        {
          _id: currency,
        },
        "symbol"
      );
      return res.json({
        success: false,
        data: "",
        message:
          "Package of " +
          findCurrency["symbol"] +
          packageAmount +
          " already exists",
      });
    } else {
      let packageObject = {
        packageAmount: packageAmount,
        packageName: "Package( " + currencySymbol + " " + packageAmount + " )",
        currency: currency,
        currencySymbol: currencySymbol,
        creationDate: new Date(),
      };

      let docToSave = new MASTER(packageObject);
      let saveDoc = await docToSave.save();

      if (saveDoc) {
        return res.json({
          success: true,
          data: "Package added successfully",
        });
      } else {
        return res.json({
          success: false,
          data: "Package added failed",
        });
      }
    }
  } catch (e) {
    return res.json({
      success: false,
      data: "Server busy",
    });
  }
};

//get
exports.getPackage = async (req, res) => {
  try {
    let packDetails = await MASTER.find({
      softDelete: false,
    }).sort({ _id: -1 });

    return res.json({
      success: true,
      data: packDetails,
      message: "Data retrieved",
    });
  } catch (e) {
    return res.json({
      success: false,
      data: e,
    });
  }
};

// update
exports.updatePackage = async (req, res) => {
  try {
    let body = req.body;
    let newAmount = body.packageVal;
    let updateDoc = await MASTER.findByIdAndUpdate(
      {
        _id: body.id,
        softDelete: false,
      },
      {
        $set: {
          packageAmount: newAmount,
          // packageName: "Package One ( $" + newAmount + " )",
          updationDate: new Date(),
        },
      }
    );
    if (updateDoc) {
      return res.json({
        success: true,
        data: "Package updated",
      });
    } else {
      return res.json({
        success: false,
        data: "Package update failed",
      });
    }
  } catch (e) {
    return res.json({
      success: false,
      data: e,
    });
  }
};

// delete api
exports.delete = async (req, res) => {
  let params = req.params.id.trim();
  if (params) {
    let delTable = await MASTER.findOneAndUpdate(
      { _id: params, softDelete: false },
      { $set: { softDelete: true } }
    );

    if (delTable) {
      return res.json({
        success: true,
        data: params.id,
        message: "Data deleted",
      });
    } else {
      return res.json({
        success: fasle,
        data: "",
        message: "Try again later",
      });
    }
  }
};
=======
const MASTER = require("./master.model");
const CURRENCY = require("../currency/currency.model");
// add package
exports.addpackage = async (req, res) => {
  try {
    let body = req.body;
    let currency = body.currency;

    let packageAmount = body.packageVal;

    let findCurrency = await CURRENCY.findOne(
      {
        _id: currency,
      },
      "symbol"
    );
    let currencySymbol;

    if (findCurrency) {
      currencySymbol = findCurrency["symbol"];
    }

    if (
      await MASTER.findOne({
        packageAmount: packageAmount,
        currency: currency,
        softDelete: false,
      })
    ) {
      let findCurrency = await CURRENCY.findOne(
        {
          _id: currency,
        },
        "symbol"
      );
      return res.json({
        success: false,
        data: "",
        message:
          "Package of " +
          findCurrency["symbol"] +
          packageAmount +
          " already exists",
      });
    } else {
      let packageObject = {
        packageAmount: packageAmount,
        packageName: "Package( " + currencySymbol + " " + packageAmount + " )",
        currency: currency,
        currencySymbol: currencySymbol,
        creationDate: new Date(),
      };

      let docToSave = new MASTER(packageObject);
      let saveDoc = await docToSave.save();

      if (saveDoc) {
        return res.json({
          success: true,
          data: "Package added successfully",
          message: "Package added successfully",
        });
      } else {
        return res.json({
          success: false,
          data: "Package added failed",
          message: "Package added failed",
        });
      }
    }
  } catch (e) {
    return res.json({
      success: false,
      data: "Server busy",
    });
  }
};

//get
exports.getPackage = async (req, res) => {
  try {
    let packDetails = await MASTER.find({
      softDelete: false,
    }).sort({ _id: -1 });

    return res.json({
      success: true,
      data: packDetails,
      message: "Data retrieved",
    });
  } catch (e) {
    return res.json({
      success: false,
      data: e,
    });
  }
};

// update
exports.updatePackage = async (req, res) => {
  try {
    let body = req.body;
    let newAmount = body.packageVal;
    let updateDoc = await MASTER.findByIdAndUpdate(
      {
        _id: body.id,
        softDelete: false,
      },
      {
        $set: {
          packageAmount: newAmount,
          // packageName: "Package One ( $" + newAmount + " )",
          updationDate: new Date(),
        },
      }
    );
    if (updateDoc) {
      return res.json({
        success: true,
        data: "Package updated",
      });
    } else {
      return res.json({
        success: false,
        data: "Package update failed",
      });
    }
  } catch (e) {
    return res.json({
      success: false,
      data: e,
    });
  }
};

// delete api
exports.delete = async (req, res) => {
  let params = req.params.id.trim();
  if (params) {
    let delTable = await MASTER.findOneAndUpdate(
      { _id: params, softDelete: false },
      { $set: { softDelete: true } }
    );

    if (delTable) {
      return res.json({
        success: true,
        data: params.id,
        message: "Data deleted",
      });
    } else {
      return res.json({
        success: fasle,
        data: "",
        message: "Try again later",
      });
    }
  }
};
>>>>>>> 52952efbcbc1d12eae3c11972edf4b06c7de663c
