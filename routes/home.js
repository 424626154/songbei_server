var _roomdir = "../";
var logger = require(_roomdir + 'utils/log4jsutil').logger(__dirname + '/home.js');
var express = require('express');
var router = express.Router();
var ru = require(_roomdir + 'utils/routersutil');
var utils = require(_roomdir + 'utils/utils');

var banners_json = require(_roomdir + 'json_data/home/Banners');
var menus_json = require(_roomdir + 'json_data/home/Menus');
var classifys = require(_roomdir + 'json_data/home/Classifys');
var items = require(_roomdir + 'json_data/home/Items');

/*---db---*/
var dbDao = require(_roomdir + 'daos/dbDaos');
var homeDao = dbDao.homeDao;
var homeClassifyDao = dbDao.homeClassifyDao;

function getItem(cid) {
    var temp_items = [];
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        if (item.cid == cid) {
            temp_items.push(item);
        }
    }
    return temp_items;
}

function getClassifyItem(cid, ciid) {
    var temp_classify_item = null;
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        if (item.cid == cid && item.id == ciid) {
            temp_classify_item = item;
        }
    }
    return temp_classify_item;
}

router.post('/home', function(req, res, next) {
    ru.logReq(req);
    try {
        var body = res.body;
        homeDao.queryHome(function(err, result) {
            if (err) {
                ru.resError(res, err);
            } else {
                var data = {};
                if (result.length > 0) {
                    var home_config = result[0]['home_config'];
                    if (home_config) {
                        data = JSON.parse(home_config);
                    }
                }
                ru.resSuccess(res, data);
            }
        })
    } catch (err) {
        ru.resError(res, err.message);
    }
});

router.post('/classifys', function(req, res, next) {
    ru.logReq(req);
    try {
        var body = req.body;
        var cid = body.cid;
        if (!cid) {
            ru.resError(res, '参数错误');
            return;
        }
        // var items = getItem(cid);
        homeClassifyDao.queryClassifyFromCid(cid, function(err, result) {
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

router.post('/classifyitem', function(req, res, next) {
    ru.logReq(req);
    try {
        var body = req.body;
        var cid = body.cid;
        var ciid = body.ciid;
        if (!cid || !ciid) {
            ru.resError(res, '参数错误');
            return;
        }
        homeClassifyDao.queryClassifyFromId(ciid, function(err, result) {
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