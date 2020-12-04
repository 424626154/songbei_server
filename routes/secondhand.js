/**
 * 二手物品
 */

var _roomdir = "../";
var logger = require(_roomdir + 'utils/log4jsutil').logger(__dirname + '/secondhand.js');
var express = require('express');
var router = express.Router();
var utils = require(_roomdir + 'utils/utils');
var httputil = require(_roomdir + 'utils/httputil');
var ru = require(_roomdir + 'utils/routersutil');

/*---db---*/
var dbDao = require(_roomdir + 'daos/dbDaos');
var secondhandDao = dbDao.secondhandDao;

router.post('/add', function(req, res, next) {
    try {
        ru.logReq(req);
        var userid = req.body.userid;
        var title = req.body.title;
        var content = req.body.content;
        var extend = req.body.extend;
        var price = req.body.price;
        var os = req.body.os;
        if (!content || !userid ) {
            ru.resError(res, '参数错误');
        } else {
            secondhandDao.addSecondhand(userid, title, content, extend, price,function(err, result) {
                if (err) {
                    ru.resError(res, err);
                } else {
                    var poem = {};
                    if (result.length > 0) {
                        poem = result[0];
                    }
                    ru.resSuccess(res, poem);
                }
            })
        }
    } catch (err) {
        ru.resError(res, err.message);
    }
});

router.post('/secondhands', function(req, res, next) {
    try {
        ru.logReq(req);
        var userid = req.body.userid;
        secondhandDao.querySecondhands(userid,function(err, result) {
                if (err) {
                    ru.resError(res, err);
                } else {
                    ru.resSuccess(res, result);
                }
            })
    } catch (err) {
        ru.resError(res, err.message);
    }
});

router.post('/info', function(req, res, next) {
    try {
        ru.logReq(req);
        var body = req.body;
        var userid = body.userid;
        var id = body.id;
        secondhandDao.querySecondhand(id,function(err, result) {
                if (err) {
                    ru.resError(res, err);
                } else {
                    var data = null;
                    if(result.length > 0){
                        data = result[0];
                    }
                    ru.resSuccess(res, data);
                }
            })
    } catch (err) {
        ru.resError(res, err.message);
    }
});


module.exports = router;