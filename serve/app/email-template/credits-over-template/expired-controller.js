const model = require("./expired-model");

exports.saveTemplate = async (req, res) => {
  let body = req.body;
  let retDoc;
  let doc = {
    subject: body.subject,
    title: body.name,
    body: body.body,
    signature: body.signature,
    creationDate: new Date(),
  };

  let update = await model.findOne({
    type: 1,
    softDelete: false,
  });

  if (update) {
    let updateDoc = await model.findOneAndUpdate(
      {
        type: 1,
        softDelete: false,
      },
      {
        $set: {
          subject: body.subject,
          title: body.name,
          body: body.body,
          signature: body.signature,
          updationDate: new Date(),
        },
      }
    );

    return res.json({
      success: true,
      message: "Payment expired Template updated",
    });
  } else {
    let insertDoc = new model(doc);
    retDoc = await insertDoc.save();
    return res.json({
      success: true,
      message: "Payment expired Template saved",
    });
  }
};

exports.getTemplate = async (req, res) => {
  let getRec = await model.findOne({
    softDelete: false,
    type: 1,
  });

  if (getRec) {
    return res.json({
      success: true,
      message: "Data Retrieved",
      data: getRec,
    });
  } else {
    return res.json({
      success: false,
      message: "",
      data: "",
    });
  }
};
