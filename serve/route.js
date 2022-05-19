module.exports = function (app) {
  // ROUTES FOR OUR API
  // =============================================================================
  // middleware to use for all requests

  app.use(function (req, res, next) {
    // do logging
    console.log("Something is happening");
    console.log(req.method + " " + req.url);
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    res.header("Access-Control-Allow-Methods", "PUT, POST, GET, PATCH, DELETE");
    next();
  });

  app.use("/api/auth", require("./app/auth"));
  app.use("/api/country", require("./app/country"));
  app.use("/api/timezone", require("./app/timezone"));
  app.use("/api/currency", require("./app/currency"));
  app.use("/api/role", require("./app/role"));
  app.use("/api/organization", require("./app/organization"));

  app.use("/api/payment", require("./app/payment"));
  app.use("/api/paymentHistory", require("./app/payment-history"));
  app.use("/api/paymentMaster", require("./app//payment-master"));

  // api for org, role, user to use in other websites
  app.use("/api/createorg", require("./app/organization"));

  app.use("/api/branch", require("./app/branch"));
  app.use("/api/department", require("./app/department"));
  app.use("/api/sub-department", require("./app/sub-department"));
  app.use("/api/user", require("./app/user"));
  app.use("/api/provider", require("./app/provider"));
  app.use("/api/assign-tariff", require("./app/assign-tariff"));
  app.use("/api/tariff", require("./app/tariff"));
  app.use("/api/call-logs", require("./app/call-logs"));
  app.use("/api/call-report-template", require("./app/call-report-template"));
  app.use("/api/call-report", require("./app/call-report"));

  // email template fot otp
  app.use(
    "/api/createOTPTemplate",
    require("./app/email-template/otp-template")
  );

  // payment goes to expire temp
  app.use(
    "/api/paymentExpireTemplate",
    require("./app/email-template/credits-expire-template")
  );

  // payment over temp
  app.use(
    "/api/paymentOver",
    require("./app/email-template/credits-over-template")
  );
};
