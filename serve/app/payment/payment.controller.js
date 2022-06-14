const nodemailer = require("nodemailer");
const paymentDB = require("./payment.model");
const ORG = require("../organization/organization.model");
const USER = require("../user/user.model");
const CURRENCY = require("../currency/currency.model");

const OTPmodel = require("../email-template/otp-template/otp-model");
const ExpireTempmodel = require("../email-template/credits-expire-template/expire.model");

const { v4: uuidv4 } = require("uuid");

const MASTER = require("../payment-master/master.model");

function generateRandomNumber() {
  var minm = 100000;
  var maxm = 999999;
  return Math.floor(Math.random() * (maxm - minm + 1)) + minm;
}

// send OTP
exports.sendOtp = async (req, res) => {
  try {
    let otp = generateRandomNumber();
    let body = req.body;
    let userEmail = body.email;
    let orgName = body.orgName;
    let transporter = nodemailer.createTransport({
      host: "smtp.office365.com",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: "Notifications@imperiumapp.com", // username
        pass: "IpiNtfy3223$", // password
      },
    });

    let options;
    let chkTemp = await OTPmodel.findOne(
      {
        type: 1,
        softDelete: false,
      },
      "to title body signature subject"
    );

    if (chkTemp) {
      let htmlContent = "";

      htmlContent += chkTemp["title"] + "<br><br>";

      htmlContent += chkTemp["body"].replaceAll("\n", "<br>") + "<br><br>";

      htmlContent +=
        "OTP for adding payment credit to the organization <b>" +
        orgName +
        "</b> is <b>" +
        otp +
        " </b> and its valid for only five minutes.<br>";

      // htmlContent += "<b>Your OTP for this request is : " + otp + "</b>";

      htmlContent += "<br><br>";

      htmlContent += chkTemp["signature"].replaceAll("\n", "<br>");

      options = {
        from: "Notifications@imperiumapp.com", // sender address
        to: chkTemp["to"], // list of receivers
        subject: chkTemp["subject"], // Subject line
        html: htmlContent,
      };
    } else {
      options = {
        from: "Notifications@imperiumapp.com", // sender address
        to: "sathishkumarksk007@gmail.com", // list of receivers
        subject: "Call Billing - Payment Verification OTP", // Subject line
        html:
          "Dear Admin, <br><br>You have requested to Initiate payment credit for organization '<b> " +
          orgName +
          " </b>' from call billing. Your OTP for this request is " +
          otp +
          " and it is valid for Five Minutes.<br><br> Thanks,<br>Call Billing Support ",
      };
    }

    transporter.sendMail(options, function (err, info) {
      if (err) {
        return res.json({
          success: false,
          message: "Try after some time",
        });
      } else {
        updateOTP(otp, userEmail);
        return res.json({
          success: true,
          data: info,
          message: "OTP Sent to " + userEmail + " and it's valid for 5 minutes",
        });
      }
    });
  } catch (err) {
    return res.json({
      success: false,
      message: "OTP Sending failed - " + err,
    });
  }
};

// verify OTP
exports.verifyOtp = async (req, res) => {
  let verifyOtp = req.body.otp;
  let adminEmail = "admin@inaipi.com";
  let checkOtp = await paymentDB.findOne(
    {
      otpSentEmail: adminEmail,
      OTP: verifyOtp,
      otpExpired: false,
    },
    "_id"
  );
  console.log(checkOtp);
  if (checkOtp) {
    let updateDoc = await paymentDB.findByIdAndUpdate(
      {
        _id: checkOtp["_id"],
        softDelete: false,
        otpExpired: false,
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

// update OTP
let updateOTP = async function (otp, adminEmailBody) {
  let newOTP = otp;
  let adminEmail = adminEmailBody;
  console.log("email body", adminEmailBody);
  const adminUser = await paymentDB.findOne({
    otpSentEmail: adminEmail,
    type: "OTP - Admin",
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
    }, 300000);
  } else {
    insertData(adminEmail);
  }
};

// insert payment details
let insertData = async function (adminEmail) {
  let output = generateRandomNumber();
  let paymentObject = {
    otpSentEmail: adminEmail,
    OTP: output,
    creationDate: new Date(),
    typeOfPayment: 2,
    package: 00,
    type: "OTP - Admin",
    otpExpired: false,
    otpVerified: false,
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

// add package details
exports.addPackage = async (req, res) => {
  // try {
  let body = req.body;
  let new_amt = body.package;
  let orgId = body.parent;
  let checkOrg = await paymentDB.findOne(
    {
      organization: orgId,
      softDelete: false,
    },
    "package availablePackage orgName"
  );
  if (checkOrg) {
    let old_amt = checkOrg["package"];
    let old_available_amt = checkOrg["availablePackage"];

    console.log("adding pack", new_amt);

    let updatedAmt = parseInt(old_amt) + parseInt(new_amt);

    let updatedAvailableAmt = parseInt(old_available_amt) + parseInt(new_amt);

    let updatePackage = await paymentDB.findOne({
      _id: checkOrg["_id"],
      softDelete: false,
    });

    if (updatePackage) {
      return res.json({
        success: true,
        data: "Id already available",

        // adminEmails: adminEmails,
        message:
          "Package for " +
          "' " +
          checkOrg["orgName"] +
          " '" +
          " is already available, Please update",
      });
    } else {
      return res.json({
        success: false,
        data: "",
        message: "Something went wrong",
      });
    }
  } else {
    let userDetails = await USER.find(
      {
        organization: orgId,
        softDelete: false,
      },
      "email"
    ).populate("role", "name");

    if (userDetails.email != "" || userDetails.email != null) {
      userEmail = userDetails["email"];
    }

    let adminEmails = [];
    let findArr;
    // var colData = [];
    for (let index in userDetails) {
      findArr = userDetails.filter(function (admin) {
        return admin.role.name == "admin";
      })[index];
      if (findArr !== undefined) {
        adminEmails.push(findArr.email);
      }
    }

    let findCurrency = await MASTER.findOne(
      {
        _id: body.package,
      },
      "packageAmount currencySymbol"
    );
    let currencySymbol;
    let packAmount;
    if (findCurrency) {
      currencySymbol = findCurrency["currencySymbol"];
      packAmount = findCurrency["packageAmount"];
    }

    let transactionId = genUniqueId();

    let packageObject = {
      otpSentEmail: "",
      OTP: body.otp,
      otpVerified: true,
      organization: body.parent,
      package: packAmount,
      availablePackage: packAmount,
      currencySymbol: currencySymbol,
      creationDate: new Date(),
      paymentTransactionId: transactionId,
    };
    let org = await ORG.findOne({
      softDelete: false,
      _id: body.parent,
    });

    if (org) {
      packageObject["orgName"] = org.name;
    }

    let checkOTPVerified = await paymentDB.findOne({
      type: "OTP - Admin",
      softDelete: false,
    });
    let docToSave = new paymentDB(packageObject);
    let retDoc;
    if (checkOTPVerified.otpVerified == true) {
      retDoc = await docToSave.save();
    } else {
      return res.json({
        success: false,
        data: "",
        message: "Check OTP",
      });
    }

    if (retDoc) {
      let updateDoc = await paymentDB.findOneAndUpdate(
        {
          type: "OTP - Admin",
          softDelete: false,
        },
        { $set: { otpVerified: false, updationDate: new Date() } }
      );
      let showAmountInMail = currencySymbol + " " + packAmount;
      // send email to admins
      sendEmailToAdminForSuccess(
        adminEmails,
        showAmountInMail,
        org.name,
        transactionId
      );
      return res.json({
        success: true,
        data: retDoc["_id"],
        adminEmails: adminEmails,
        OTPVerified: checkOTPVerified.otpVerified,
        message: "Packaged Added to - " + "' " + org.name + " '",
      });
    } else {
      return res.json({
        success: false,
        data: "",
        message: "Something went wrong",
      });
    }
  }
  // } catch (e) {
  //   return res.json({
  //     success: false,
  //     data: "",
  //     message: e,
  //   });
  // }
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
          let arrList = [];
          let arr;
          let pendingAmmountPer;
          let totalAmt;
          let availableAmt;
          for (let index in result) {
            arr = result[index];

            totalAmt = arr["package"];
            availableAmt = arr["availablePackage"];
            pendingAmmountPer = Math.round((availableAmt / totalAmt) * 100);

            // send alert if available amount goes to less than 70% from total amount
            if (pendingAmmountPer < 30) {
              arr["paymentGoingToExpire"] = true;
            } else {
              arr["paymentGoingToExpire"] = false;
            }
            arr["checkPercentage"] = pendingAmmountPer;
            arrList.push(arr);
          }
          return res.json({
            success: true,
            data: arrList,
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

      let transactionId = genUniqueId();

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
            paymentTransactionId: transactionId,
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
    ).populate("role", "name");
    let userEmail = "";
    if (userDetails.email != "" || userDetails.email != null) {
      userEmail = userDetails["email"];
    }

    let adminEmails = [];
    let findArr;
    // var colData = [];
    for (let index in userDetails) {
      findArr = userDetails.filter(function (admin) {
        return admin.role.name == "admin";
      })[index];
      if (findArr !== undefined) {
        adminEmails.push(findArr.email);
      }
    }

    // send email
    sendEmailToAdmin(adminEmails);

    return res.json({
      success: true,
      data: adminEmails,
      message: "Payment expire notification sent",
    });
  }
};

// send email function
let sendEmailToAdmin = async (recivers) => {
  // console.log(recivers, "testttt");
  let transporter = nodemailer.createTransport({
    host: "smtp.office365.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: "Notifications@imperiumapp.com", // username
      pass: "IpiNtfy3223$", // password
    },
  });

  let admiEmail = recivers;

  let options;
  let chkTemp = await ExpireTempmodel.findOne(
    {
      type: 1,
      softDelete: false,
    },
    "title body signature subject"
  );
  if (chkTemp) {
    let htmlContent = "";

    htmlContent += chkTemp["title"] + "<br><br>";

    htmlContent += chkTemp["body"].replaceAll("\n", "<br>") + "<br><br>";

    htmlContent += chkTemp["signature"].replaceAll("\n", "<br>");

    options = {
      from: "Notifications@imperiumapp.com", // sender address
      to: admiEmail, // list of receivers
      subject: chkTemp["subject"], // Subject line
      html: htmlContent,
    };
  } else {
    options = {
      from: "Notifications@imperiumapp.com", // sender address
      to: admiEmail, // list of receivers
      subject: "Call Billing - Notify for Payment", // Subject line
      html: "Dear Admin, <br><br>We noticed that payment credits for your organization going to expire, please recharge immediately.<br><br> Thanks,<br>Call Billing Support ",
    };
  }

  transporter.sendMail(options, function (err, info) {
    if (err) {
      console.log(err);
      return;
    }
  });
};

function sendEmailToAdminForSuccess(recivers, package, orgName, transactionId) {
  let transporter = nodemailer.createTransport({
    host: "smtp.office365.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: "Notifications@imperiumapp.com", // username
      pass: "IpiNtfy3223$", // password
    },
  });

  let admiEmail = recivers;

  const options = {
    from: "Notifications@imperiumapp.com", // sender address
    to: admiEmail, // list of receivers
    subject: "Call Billing - Notify for Payment", // Subject line
    html:
      "Dear Admin, <br><br> For your request of adding package <b>" +
      package +
      " </b> to <b>" +
      orgName +
      "</b> Organization added successfully. Any clarification contact us.<br><br>Payment Transaction Id: " +
      transactionId +
      "<br><br>Thanks,<br>Call Billing Support",
  };

  transporter.sendMail(options, function (err, info) {
    if (err) {
      console.log(err);
      return;
    }
  });
}

exports.getPaymentDetails = async (req, res) => {
  // Find user to see if it exists
  let body = req.body;
  let user = await fetchUser(body.email);
  console.log("User found", user);

  let userPayment = await paymentDB.findOne(
    { organization: user.organization._id, softDelete: false },
    "availablePackage package orgName currencySymbol"
  );

  let pendingAmmountPer;
  let totalAmt;
  let availableAmt;
  let paymentGoingToExpire;
  let currencySymbol;

  if (userPayment) {
    totalAmt = userPayment["package"];
    availableAmt = userPayment["availablePackage"];
    pendingAmmountPer = Math.round((availableAmt / totalAmt) * 100);
    if (pendingAmmountPer < 30) {
      paymentGoingToExpire = true;
    } else {
      paymentGoingToExpire = false;
    }

    return res.json({
      success: true,
      data: {
        organization: user.organization,
        availableAmount: userPayment["availablePackage"],
        totalAmount: totalAmt,
        availablePayment: availableAmt,
        checkPercentage: pendingAmmountPer,
        paymentGoingToExpire: paymentGoingToExpire,
        currencySymbol: currencySymbol,
      },
    });
  }
};

async function fetchUser(email) {
  let userQuery = { email: email, softDelete: false, enableLogin: true };

  let user = await USER.findOne(
    userQuery,
    "firstName lastName email token role organization branch password type loginType"
  ).populate("organization");

  return user;
}

exports.getPackageUsingCurrency = async (req, res) => {
  try {
    let body = req.body;

    let getPackageUsingCurrency = await MASTER.find({
      currencySymbol: body.currency,
      softDelete: false,
    });

    return res.json({
      success: true,
      data: getPackageUsingCurrency,
    });
  } catch (e) {
    return res.json({
      success: false,
      data: "",
    });
  }
};

function genUniqueId() {
  const uniqueId = uuidv4();
  return uniqueId;
}
