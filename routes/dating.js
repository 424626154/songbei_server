/**
 * 二手物品
 */

var _roomdir = "../";
var logger = require(_roomdir + 'utils/log4jsutil').logger(__dirname + '/dating.js');
var express = require('express');
var router = express.Router();
var utils = require(_roomdir + 'utils/utils');
var httputil = require(_roomdir + 'utils/httputil');
var ru = require(_roomdir + 'utils/routersutil');

/*---db---*/
var dbDao = require(_roomdir + 'daos/dbDaos');
var datingDao = dbDao.datingDao;

router.post('/myinfo', function(req, res, next) {
    try {
        ru.logReq(req);
        var userid = req.body.userid;
        var os = req.body.os;
        if (!userid) {
            ru.resError(res, '参数错误');
        } else {
            datingDao.queryInfo(userid, function(err, result) {
                if (err) {
                    ru.resError(res, err);
                } else {
                    console.log(result);
                    var info = null;
                    if (result.length > 0) {
                        info = result[0];
                    }
                    ru.resSuccess(res, info);
                }
            })
        }
    } catch (err) {
        ru.resError(res, err.message);
    }
});


router.post('/otherinfo', function(req, res, next) {
    try {
        ru.logReq(req);
        var body = req.body;
        var userid = body.userid;
        var myid = body.myid;
        var os = body.os;
        if (!userid) {
            ru.resError(res, '参数错误');
        } else {
            datingDao.queryInfo(userid, function(err, result) {
                if (err) {
                    ru.resError(res, err);
                } else {
                    console.log(result);
                    var info = null;
                    if (result.length > 0) {
                        info = result[0];
                    }
                    ru.resSuccess(res, info);
                }
            })
        }
    } catch (err) {
        ru.resError(res, err.message);
    }
});

router.post('/upinfo', function(req, res, next) {
    try {
        ru.logReq(req);
        var body = req.body;
        var userid = body.userid;
        var gender = body.gender;
        var birth_date = body.birth_date;
        var height = body.height;
        var weight = body.weight;
        var degree = body.degree;
        var location = body.location;
        var self_describe = body.self_describe;
        var os = req.body.os;
        if (!userid) {
            ru.resError(res, '参数错误');
        } else {
            datingDao.addInfo(userid, gender, birth_date, height, weight, degree, location, self_describe, function(err, result) {
                if (err) {
                    ru.resError(res, err);
                } else {
                    console.log(result)
                    var data = body;
                    ru.resSuccess(res, data);
                }
            })
        }
    } catch (err) {
        ru.resError(res, err.message);
    }
});


router.post('/upstate', function(req, res, next) {
    try {
        ru.logReq(req);
        var body = req.body;
        var userid = body.userid;
        var state = body.state;
        var os = req.body.os;
        if (!userid) {
            ru.resError(res, '参数错误');
        } else {
            datingDao.upState(userid, state, function(err, result) {
                if (err) {
                    ru.resError(res, err);
                } else {
                    console.log(result)
                    var data = body;
                    ru.resSuccess(res, data);
                }
            })
        }
    } catch (err) {
        ru.resError(res, err.message);
    }
});

router.post('/datings', function(req, res, next) {
    try {
        ru.logReq(req);
        var body = req.body;
        var userid = body.userid;
        var os = req.body.os;
        datingDao.queryDatings(function(err, result) {
            if (err) {
                ru.resError(res, err);
            } else {
                // console.log(result)
                var data = result;
                ru.resSuccess(res, data);
            }
        })
    } catch (err) {
        ru.resError(res, err.message);
    }
});





module.exports = router;