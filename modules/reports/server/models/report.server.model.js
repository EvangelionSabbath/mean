'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Report Schema
 */
var ReportSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  lat: {
    type: String,
    default: '',
    trim: true, 
  },
  lng: {
    type: String,
    default: '',
    trim: true
  },
  city: {
    type: String,
    default: '',
    trim: true
  },
  voltage: {
    type: String,
    default: '',
    trim: true
  },
  expected: {
    type: Number,
    default: '',
    trim: true
  },
  actual: {
    type: Number,
    default: '',
    trim: true
  },
  period_from: {
    type: Date,
    default: '',
    trim: true
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

mongoose.model('Report', ReportSchema);
