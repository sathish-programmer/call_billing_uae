const config = require('../../config');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
let mongoURL;

// build connection string
if (config.DB_HOST == 'localhost') {
  mongoURL = `mongodb://${config.DB_HOST}:${config.DB_PORT}/${config.DB_NAME}`;
} else {
  //console.log(config.DB_USERNAME);
  mongoURL = `mongodb://${encodeURIComponent(config.DB_USERNAME)}:${encodeURIComponent(config.DB_PASSWORD)}@${config.DB_HOST}:${config.DB_PORT}/${config.DB_NAME}`;
}

// set up mongoose connection
mongoose.connect(mongoURL, { useCreateIndex: true, useFindAndModify: false, useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set('debug', true);

const db = mongoose.connection;
db.on('connected', function () {
  console.info('Database connection succeeded.');
});

db.on('error', function (err) {
  console.error('Error connecting to database.', err);
});

db.on('disconnected', function () {
  console.info('Database disconnected.');
});