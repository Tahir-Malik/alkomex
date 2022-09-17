require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const http = require('http');
const config = require('./config');
dirName = __dirname;

const apiRouter = require('./src/routes/api');

const app = express();
app.use(cors());
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/api', apiRouter);

mongoose.Promise = global.Promise;
mongoose.set('useCreateIndex', true);
mongoose
  .connect(process.env.DATABASE_URL, { useNewUrlParser: true })
  .then(() => {
    console.log('Successfully connected to the database');
  })
  .catch(err => {
    console.log('Could not connect to the database. Exiting now...');
    process.exit(); // to close app Completely
  });

app.get('/', (req, res) => {
  console.log('object');
  res.json({ message: 'Welcome to Alchomex' });
});

var httpServer = http.createServer(app);
console.log(process.env.PORT);
httpServer.listen(process.env.PORT);

exports.closeServer = function () {
  httpServer.close();
};
