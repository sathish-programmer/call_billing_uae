const ORG = require("../organization/organization.model");
const USER = require("../user/user.model");
const PDFDocument = require("pdfkit");
const paymentHistory = require("./paymentHistory.model");
const paymentDB = require("../payment/payment.model");

exports.savePayment = async (req, res) => {
  return res.json({
    success: true,
    data: "test",
  });
};

// get history list
exports.list = async (req, res) => {
  try {
    let params = req.params;
    let paymentHistoryDet = await paymentHistory
      .find({
        organization: params.orgId,
        isCostCalculated: true,
        softDelete: false,
      })
      .sort({ _id: -1 });

    return res.json({
      success: true,
      data: paymentHistoryDet,
      message: "Payment history retrieved",
    });
  } catch (e) {
    return res.json({
      success: false,
      data: e,
    });
  }
};

// download pdf
exports.generatePdf = async (req, res) => {
  let params = req.params;
  let getDoc = await paymentHistory.findOne({
    uniqueId: params.uniqueId,
    isCostCalculated: true,
    softDelete: false,
  });
  let orgName;
  let fullAmount;
  let resultPayHis = getDoc;
  if (getDoc) {
    let getPaymentDet = await paymentDB.findOne({
      organization: getDoc.organization,
      softDelete: false,
    });
    fullAmount = getPaymentDet.package;
    orgName = getPaymentDet.orgName;
  }

  const PDFDocument = require("pdfkit");
  const fs = require("fs");

  // Create a document
  const doc = new PDFDocument();

  // Pipe its output somewhere, like to a file or HTTP response
  // See below for browser usage
  doc.pipe(fs.createWriteStream("output.pdf"));

  // Add another page
  doc.addPage().fontSize(25).text("Here is some vector graphics...", 100, 100);

  // Draw a triangle
  doc.save().moveTo(100, 150).lineTo(100, 250).lineTo(200, 250).fill("#FF3300");

  // Apply some transforms and render an SVG path with the 'even-odd' fill rule
  doc
    .scale(0.6)
    .translate(470, -380)
    .path("M 250,75 L 323,301 131,161 369,161 177,301 z")
    .fill("red", "even-odd")
    .restore();

  // Add some text with annotations
  doc
    .addPage()
    .fillColor("blue")
    .text("Here is a link!", 100, 100)
    .underline(100, 100, 160, 27, { color: "#0000FF" })
    .link(100, 100, 160, 27, "http://google.com/");

  // Finalize PDF file
  doc.end();

  // return res.json({
  //   success: true,
  //   data: getDoc,
  //   organizationName: orgName,
  //   totalPackage: fullAmount,
  // });

  // const doc = new PDFDocument();
  // let filename = "yourReport";
  // // Stripping special characters
  // filename = encodeURIComponent(filename) + ".pdf";
  // // Setting response to 'attachment' (download).
  // // If you use 'inline' here it will automatically open the PDF
  // res.setHeader(
  //   "Content-disposition",
  //   'attachment; filename="' + filename + '"'
  // );
  // res.setHeader("Content-type", "application/pdf");
  // const content = req.body.content;
  // doc.y = 300;
  // doc.text(content, 50, 50);
  // doc.pipe(res);
  // doc.end();
};
