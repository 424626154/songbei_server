var _roomdir = "../";
var logger = require(_roomdir + 'utils/log4jsutil').logger(__dirname + '/apph5.js');
var express = require('express');
var router = express.Router();


router.get('/index', function(req, res, next) {
  res.render("apph5/index");
});

router.get('/about', function(req, res, next) {
  res.render("apph5/about");
});

router.get('/privacy_policy', function(req, res, next) {
  res.render("apph5/privacy_policy");
});

router.get('/agreement', function(req, res, next) {
  res.render("apph5/agreement");
});

router.get('/upinfolist', function(req, res, next) {
  res.render("apph5/upinfolist");
});

router.get('/help', function(req, res, next) {
  res.render("apph5/help");
});

router.get('/thanks', function(req, res, next) {
  res.render("apph5/thanks");
});

router.get('/banner', function(req, res, next) {
  res.render("apph5/banner");
});

module.exports = router;