const express = require('express');
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');

global.DOCUMENT_ROOT = __dirname;

const settings = require(path.join(DOCUMENT_ROOT, 'lib', 'settings'));
const app = express();

// uncomment after placing your favicon in /public
// app.use(favicon(__dirname + '/public/favicon/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', require('./routes/index'));

settings.lang.forEach(lang => {
    app.use(`/${lang}`, require(`./routes/${lang}`));
});

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json (err);
});


module.exports = app;
