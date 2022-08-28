var express = require("express");
var app = express();

var metadataRouter = require('./routes/api/token-metadata')
app.use('/hidden', metadataRouter);

module.exports = app;
