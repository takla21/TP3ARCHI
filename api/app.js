require("dotenv").load();
const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');

global.DOCUMENT_ROOT = __dirname;

const app = express();

// uncomment after placing your favicon in /public
// app.use(favicon(__dirname + '/public/favicon/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());

app.use('/', require('./routes/index'));

app.use(function(req, res, next) {
    res.sendStatus(404);
})
// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json(err);
    console.log(err)
});


module.exports = app;
