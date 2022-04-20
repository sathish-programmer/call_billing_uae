const nodemailer = require("nodemailer");
const paymentDB = require("./payment.model");
const ORG = require("../organization/organization.model");
const USER = require("../user/user.model");
function generateRandomNumber() {
  var minm = 100000;
  var maxm = 999999;
  return Math.floor(Math.random() * (maxm - minm + 1)) + minm;
}

exports.sendOtp = async (req, res) => {
  try {
    let otp = generateRandomNumber();
    let body = req.body;
    let userEmail = body.email;
    let transporter = nodemailer.createTransport({
      host: "smtp.office365.com",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: "Notifications@imperiumapp.com", // username
        pass: "IstNfy4747@", // password
      },
    });

    const options = {
      from: "Notifications@imperiumapp.com", // sender address
      to: "sathishkumarksk007@gmail.com", // list of receivers
      subject: "Call Billing - Payment Verification OTP", // Subject line
      html:
        "Dear User, <br><br>You have requested to Initiate payment credit from call billing. Your OTP for this request is " +
        otp +
        " and it is valid for one minutes.<br><br> Thanks,<br>Call Billing Support ",
    };

    transporter.sendMail(options, function (err, info) {
      if (err) {
        console.log(err);
        return;
      }
    });
    updateOTP(otp, userEmail);
    return res.json({
      success: true,
      message: "OTP Sent to " + userEmail,
    });
  } catch (err) {
    return res.json({
      success: false,
      message: "OTP Sending failed - " + err,
    });
  }
};

exports.verifyOtp = async (req, res) => {
  let verifyOtp = req.body.otp;
  let adminEmail = "admin@inaipi.com";
  const checkOtp = await paymentDB.findOne({
    otpSentEmail: adminEmail,
    OTP: verifyOtp,
    otpExpired: false,
  });
  if (checkOtp) {
    let updateDoc = await paymentDB.findByIdAndUpdate(
      {
        _id: checkOtp["_id"],
        softDelete: false,
        otpExpired: false,
        updationDate: new Date(),
      },
      { $set: { otpVerified: true, updationDate: new Date() } }
    );
    return res.json({
      success: true,
      message: "OTP verified successfully",
    });
  } else {
    return res.json({
      success: false,
      message: "OTP is invalid",
    });
  }
};

let updateOTP = async function (otp, adminEmailBody) {
  let newOTP = otp;
  let adminEmail = adminEmailBody;
  const adminUser = await paymentDB.findOne({
    otpSentEmail: adminEmail,
    softDelete: false,
  });
  if (adminUser) {
    let updateDoc = await paymentDB.findByIdAndUpdate(
      { _id: adminUser["_id"], softDelete: false, updationDate: new Date() },
      {
        $set: {
          OTP: newOTP,
          updationDate: new Date(),
          otpExpired: false,
          otpVerified: false,
          typeOfPayment: 2,
        },
      }
    );

    setTimeout(async () => {
      // Code goes here
      let updateDoc = await paymentDB.findByIdAndUpdate(
        { _id: adminUser["_id"], softDelete: false, updationDate: new Date() },
        {
          $set: {
            updationDate: new Date(),
            otpExpired: true,
            otpVerified: false,
            typeOfPayment: 2,
          },
        }
      );
    }, 50000);
  } else {
    insertData(adminEmail);
  }
};

let insertData = async function (adminEmail) {
  let output = generateRandomNumber();
  let paymentObject = {
    otpSentEmail: adminEmail,
    OTP: output,
    creationDate: new Date(),
    typeOfPayment: 2,
    package: 00,
  };

  let docToSave = new paymentDB(paymentObject);
  let saveDoc = await docToSave.save();
  if (saveDoc) {
    // return res.json({
    //   success: true,
    //   data: saveDoc["_id"],
    //   message: "Record inserted",
    // });
  } else {
    // return res.json({
    //   success: false,
    //   data: "",
    //   message: "Something went wrong",
    // });
  }
};

// insert and update data in payment
// exports.saveData = async (req, res) => {
//   let adminId = "625e9ef88cb36b107cd68ab2";
//   let adminEmail = "admin@inaipi.com";
//   const adminUser = await paymentDB.findOne({
//     otpSentEmail: adminEmail,
//   });
//   if (adminUser) {
//     let output = generateRandomNumber();
//     let updateObject = { OTP: output };
//     let updateDoc = await paymentDB.findByIdAndUpdate(
//       { _id: adminUser["_id"], softDelete: false, updationDate: new Date() },
//       { $set: { OTP: output, updationDate: new Date() } }
//     );

//     if (updateDoc) {
//       return res.json({
//         success: true,
//         data: updateDoc["_id"],
//         OTP: output,
//         message: "Record Updated",
//       });
//     } else {
//       return res.json({
//         success: false,
//         data: "",
//         message: "Something went wrong",
//       });
//     }
//   } else {
//     let output = generateRandomNumber();
//     let paymentObject = {
//       otpSentEmail: adminEmail,
//       OTP: output,
//       creationDate: new Date(),
//     };
//     let docToSave = new paymentDB(paymentObject);
//     let saveDoc = await docToSave.save();
//     if (saveDoc) {
//       return res.json({
//         success: true,
//         data: saveDoc["_id"],
//         message: "Record inserted",
//       });
//     } else {
//       return res.json({
//         success: false,
//         data: "",
//         message: "Something went wrong",
//       });
//     }
//   }
// };
exports.addPackage = async (req, res) => {
  try {
    let body = req.body;
    let orgId = body.parent;
    const checkOrg = await paymentDB.findOne(
      {
        organization: orgId,
        softDelete: false,
      },
      "package availablePackage"
    );
    if (checkOrg) {
      let old_amt = checkOrg["package"];
      let old_available_amt = checkOrg["availablePackage"];
      let new_amt = body.package;

      let updatedAmt = parseInt(old_amt) + parseInt(new_amt);

      let updatedAvailableAmt = parseInt(old_available_amt) + parseInt(new_amt);

      let updatePackage = await paymentDB.findByIdAndUpdate(
        {
          _id: checkOrg["_id"],
          softDelete: false,
        },
        {
          $set: {
            OTP: body.otp,
            updationDate: new Date(),
            package: updatedAmt,
            availablePackage: updatedAvailableAmt,
          },
        }
      );

      if (updatePackage) {
        return res.json({
          success: true,
          data: "New Available Credit is - " + updatedAmt,
          message: "Package for " + orgId + " is updated",
        });
      } else {
        return res.json({
          success: false,
          data: "",
          message: "Something went wrong",
        });
      }
    } else {
      let packageObject = {
        otpSentEmail: "",
        OTP: body.otp,
        otpVerified: true,
        organization: body.parent,
        package: body.package,
        availablePackage: body.package,
        currencySymbol: "$",
        creationDate: new Date(),
      };
      let org = await ORG.findOne({
        softDelete: false,
        _id: body.parent,
      });

      if (org) {
        packageObject["orgName"] = org.name;
      }

      let docToSave = new paymentDB(packageObject);
      let retDoc = await docToSave.save();
      if (retDoc) {
        return res.json({
          success: true,
          data: retDoc["_id"],
          message: "Packaged Added to - " + retDoc["_id"],
        });
      } else {
        return res.json({
          success: false,
          data: "",
          message: "Something went wrong",
        });
      }
    }
  } catch (e) {
    return res.json({
      success: false,
      data: "",
      message: e,
    });
  }
};

// get all payment org details
exports.getAllList = async (req, res) => {
  try {
    paymentDB
      .find({ typeOfPayment: 1, softDelete: false }, function (err, result) {
        if (err) {
          res.send(err);
        } else {
          // res.send(JSON.stringify(result));
          return res.json({
            success: true,
            data: result,
            message: "List retrieved",
          });
        }
      })
      .sort({ _id: -1 })
      .lean();
  } catch (e) {
    return res.json({
      success: false,
      data: "",
      message: "Something went wrong",
    });
  }
};

// edit api
exports.editPayment = async (req, res) => {
  try {
    let params = req.params;
    let body = req.body;
    if (params.paymentId) {
      let updateObj = {
        package: body.assignedAmount,
        availablePackage: body.pendingAmount,
      };

      let updateDoc = await paymentDB.findByIdAndUpdate(
        {
          _id: params.paymentId,
          softDelete: false,
        },
        {
          $set: {
            package: body.assignedAmount,
            availablePackage: body.pendingAmount,
            updationDate: new Date(),
          },
        }
      );

      if (updateDoc) {
        return res.json({
          success: true,
          data: params.paymentId,
          message: "Payment edited successfully",
        });
      } else {
        return res.json({
          success: false,
          data: "",
          message: "Payment edited failed, try again later",
        });
      }
    }
  } catch (e) {
    return res.json({
      success: false,
      data: "",
      message: "Something went wrong",
    });
  }
};

// delete api
exports.deletePayment = async (req, res) => {
  let params = req.params;

  if (params.paymentId) {
    let delTable = await paymentDB.findOneAndUpdate(
      { _id: params.paymentId, softDelete: false, typeOfPayment: 1 },
      { $set: { softDelete: true } }
    );

    if (delTable) {
      return res.json({
        success: true,
        data: params.paymentId,
        message: "Payment linked with the organization Deleted",
      });
    } else {
      return res.json({
        success: false,
        data: params.paymentId,
        message: "Something went wrong",
      });
    }
  }
};

// notify payment expire alert
exports.notifyPaymentExpire = async (req, res) => {
  let parmas = req.params;
  if (parmas.orgId) {
    let userDetails = await USER.find(
      {
        organization: parmas.orgId,
        softDelete: false,
      },
      "email"
    );
    let userEmail = "";
    if (userDetails.email != "" || userDetails.email != null) {
      userEmail = userDetails["email"];
    }

    return res.json({
      success: true,
      data: userDetails,
      message: "Payment expire notification sent",
    });
  }
};
