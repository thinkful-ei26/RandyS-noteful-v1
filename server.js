'use strict';

const express = require('express');
const morgan = require('morgan');

// Simple In-Memory Database
// const data = require('./db/notes');
// const simDB = require('./db/simDB');
// const notes = simDB.initialize(data);

// const logger = require('./middleware/logger');
const { PORT } = require('./config');

// Create an Express application
const app = express();

// Create router 
const notesRouter = require('./router/notes.router');
// Log all requests
// app.use(logger);

// Create a static webserver
app.use(express.static('public'));

// Parse request body
app.use(express.json());

//log all requests with morgan
app.use(morgan('dev'));

// send all requests to Notes router
app.use('/api/notes', notesRouter);



// Catch-all 404
app.use(function (req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Catch-all Error handler
// NOTE: we'll prevent stacktrace leak in later exercise
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: err
  });
});

// Listen for incoming connections
if (require.main === module) {
  app.listen(PORT, function () {
    console.info(`Server listening on ${this.address().port}`);
  }).on('error', err => {
    console.error(err);
  });
}

module.exports = app;