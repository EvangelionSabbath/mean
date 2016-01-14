'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Report = mongoose.model('Report'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Create a report
 */
exports.create = function (req, res) {
  var report = new Report(req.body);
  report.user = req.user;

  report.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(report);
    }
  });
};

/**
 * Show the current report
 */
exports.read = function (req, res) {
  res.json(req.report);
};

/**
 * Update a report
 */
exports.update = function (req, res) {
  var report = req.report;

  report.title = req.body.title;
  report.lat = req.body.lat;
  report.lng = req.body.lng;
  report.city = req.body.city;
  report.voltage = req.body.voltage;


  report.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(report);
    }
  });
};

/**
 * Delete a report
 */
exports.delete = function (req, res) {
  var report = req.report;

  report.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(report);
    }
  });
};

/**
 * List of Reports
 */
exports.list = function (req, res) {
  Report.find().sort('-created').populate('user', 'displayName').exec(function (err, reports) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(reports);
    }
  });
};

/**
 * Report middleware
 */
exports.reportByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Report is invalid'
    });
  }

  Report.findById(id).populate('user', 'displayName').exec(function (err, report) {
    if (err) {
      return next(err);
    } else if (!report) {
      return res.status(404).send({
        message: 'No report with that identifier has been found'
      });
    }
    req.report = report;
    next();
  });
};
