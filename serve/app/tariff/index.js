var express = require('express');
const { checkAuth } = require("../middleware");
const controller = require('./tariff.controller');
const tariffFileController = require('./tariffFile.controller');
const tariffRateAndTimeController = require("./tariffRateAndTime.controller");
const multer = require("multer");
var router = express.Router();

var storage = multer.diskStorage(
  {
    destination: globalPath + '/public/uploads/',
    filename: function (req, file, cb) {
      cb(null, 'file_' + Date.now() + '.csv');
    }
  }
);

var upload = multer({ storage: storage });

router.post('/from/file', checkAuth, controller.saveTariffFromFile);
router.post('/file', checkAuth, upload.single('file'), tariffFileController.saveTariffFile);
router.post('/rate-and-time', checkAuth, tariffRateAndTimeController.addTariffRateAndTime);
router.post('', checkAuth, controller.addTariff);
router.get('/rate-and-time/:tariffId', checkAuth, tariffRateAndTimeController.getRateAndTimeAsPerTariff);
router.get("/file/:orgId", checkAuth, tariffFileController.getTariffFileList);
router.get('/:tariffId/single', checkAuth, controller.getSingleTariff);
router.get("/:orgId", checkAuth, controller.getTariffList);
router.patch('/rate-and-time/:tariffRateAndTimeId', checkAuth, tariffRateAndTimeController.updateTariffRateAndTime);
router.patch('/:tariffId', checkAuth, controller.updateTariff);
router.delete('/rate-and-time/:tariffRateAndTimeId', checkAuth, tariffRateAndTimeController.deleteTariffRateAndTime);
router.delete('/file/:tariffFileId', checkAuth, tariffFileController.deleteTariffFile);
router.delete('/:tariffId', checkAuth, controller.deleteTariff);

module.exports = router;