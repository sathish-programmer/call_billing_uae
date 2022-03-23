const TARIFF_FILE =  require("./tariffFile.model");

// Save Tariff File
exports.saveTariffFile = async (req, res) => {
  try {
    let body = req.body;
    let file = req.file;

    if (file && body.name && body.extension && body.organization) {
      let dataToSave = new TARIFF_FILE({organization : body.organization,
                                        name : body.name,
                                        nameSaved: file.filename,
                                        extension : body.extension,
                                        type : body.type || '',
                                        errors : [],
                                        creationDate : new Date(),
                                        createdBy : req.user._id,
                                        softDelete: false});

      let retDoc = await dataToSave.save();
      return res.json({success: true, data: retDoc['_id'], message: "File saved successfully"});
    } else {
      return res.json({success: false, data:"", message: "Missing Data"});
    }
  } catch (err) {
    console.log("Error while saving tariff file", err);
    return res.json({success: false, data: "", message: err});
  }
}

// Get Tariff File List
exports.getTariffFileList = async (req, res) => {
  try {
    let params = req.params;
    let query = req.query;

    if (params.orgId) {
      let tariffFileQuery = {organization: params.orgId, softDelete: false};
      let filterQuery = {"sort": {"creationDate":-1}};

      if (parseInt(query.skip) && parseInt(query.limit)) {
        filterQuery['skip'] = (parseInt(query.skip) -1)*(parseInt(query.limit));
        filterQuery['limit'] = parseInt(query.limit);                
      }

      let retDocs = await TARIFF_FILE.find(tariffFileQuery, '', filterQuery);
      let total = await TARIFF_FILE.countDocuments(tariffFileQuery);

      return res.json({success: true, data: retDocs, message: "Found list", total: total});
    } else {
      return res.json({success: false, data:"", message: "Organization Missing"});
    }
  } catch (err) {
    return res.json({success: false, data: "", message: err});
  }
}

// Delete Tariff file, it only deletes the File not the tariff
exports.deleteTariffFile = async (req, res) => {
  try {
    let params = req.params;

    if (params.tariffFileId) {
      await TARIFF_FILE.findByIdAndUpdate({_id: params.tariffFileId}, {"$set": {softDelete: true}});
      return res.json({success: true, data: '', message: "Deleted File"});
    } else {
      return res.json({success: false, data:"", message: "Missing File Id"});
    }
  } catch (err) {
    return res.json({success: false, data: "", message: err});
  }
}