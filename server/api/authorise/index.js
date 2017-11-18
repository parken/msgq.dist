'use strict';

var express = require('express');
var controller = require('./authorise.controller');

var router = express.Router();

router.get('/', function (r, res, next) {
  var req = r;
  if (req.query.redirect_uri === 'http://localhost:3017/api/auth/callback') {
    req.query.redirect_uri = 'http://127.0.0.1:3017/api/auth/callback';
  }

  return next();
}, controller.index);

router.post('/', function (r, res, next) {
  var req = r;
  if (req.body.redirect_uri === 'http://localhost:3017/api/auth/callback') {
    req.body.redirect_uri = 'http://127.0.0.1:3017/api/auth/callback';
  }

  return next();
}, function () {});

module.exports = router;
//# sourceMappingURL=index.js.map
