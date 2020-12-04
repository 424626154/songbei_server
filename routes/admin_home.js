var _roomdir = "../";
var logger = require(_roomdir+'utils/log4jsutil').logger(__dirname + '/admin/home.js');
var express = require('express');
var router = express.Router();
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
// var gm = require('gm').subClass({ imageMagick: true });
var utils = require(_roomdir + 'utils/utils');
var ru = require(_roomdir + 'utils/routersutil');
var qiniuutil = require(_roomdir + 'utils/qiniuutil');

var daos = require(_roomdir + 'daos/dbDaos')
var homeDao = daos.homeDao;

router.get('/', function(req, res, next) {
    try {
        var user = req.cookies.songbei_admin_user;
        if (!user) {
            res.redirect("/admin/login");
            return;
        }
        var parm = { user: user, err: null, obj: null };
        homeDao.queryHome(function(err, result) {
            if (err) {
                parm.err = err
                console.error(err);
            } else {
                if (result.length > 0) {
                    parm.obj = JSON.parse(result[0]['home_config']);
                    console.log(parm.obj);
                }
            }
            res.render('admin/home', parm);
        })
    } catch (err) {
        console.error(err);
        // res.redirect("/admin/login");
    }
});

router.post('/', function(req, res, next) {
    try {
        ru.logReq(req);
        var body = req.body;
        var op = body.op;
        var id = body.id;
        console.log(id)
        var state = 0;
        if (op == 'state1') {
            bookDao.updateState(id, 1, function(err, result) {
                if (err) {
                    ru.resError(res, err)
                } else {
                    state = 1;
                    ru.resSuccess(res, { op: op, state: state, id: id });
                }
            });
            return;
        } else if (op == 'state0') {
            bookDao.updateState(id, 0, function(err, result) {
                if (err) {
                    ru.resError(res, err)
                } else {
                    state = 0;
                    ru.resSuccess(res, { op: op, state: state, id: id });
                }
            });
            return;
        } else if (op == 'del') {
            bookDao.delete(id, function(err, result) {
                if (err) {
                    ru.resError(res, err)
                } else {
                    ru.resSuccess(res, { op: op, id: id });
                }
            });
            return;
        }
    } catch (err) {
        ru.resError(res, err.message);
    }
});

router.get('/add', function(req, res, next) {
    try {
        var user = req.cookies.songbei_admin_user;
        if (!user) {
            res.redirect("/admin/login");
            return;
        }
        var parm = { user: user, err: null };
        res.render('admin/books_add', parm);
    } catch (err) {
        // console.error(err);
        res.redirect("/admin/login");
    }
});

/**
 * { name: '12',
  shuoming: '23',
  tiaojian: 'shijian',
  number: '',
  time: '2020-02-28 02:14:46',
  fangshi: 'shoudong',
  prize_url: '' }
 * @param  {[type]} req   [description]
 * @param  {[type]} res   [description]
 * @param  {[type]} next) {             var user [description]
 * @return {[type]}       [description]
 */
router.post('/add', multipartMiddleware, function(req, res, next) {
    var user = req.cookies.songbei_admin_user;
    try {
        var parm = { user: user, err: null };
        var body = req.body;
        console.log(body)
        var name = body.name;
        var all_page = body.all_page;
        var pages = body.pages;
        var cover = body.cover;
        if (!name || !all_page || !pages || !cover) {
            parm.err = new Error('参数错误')
            res.render('admin/books_add', parm);
            return;
        }
        bookDao.addBook(name, all_page, pages, cover, function(err, result) {
            if (err) {
                console.error(err);
                parm.err = err;
                res.render('admin/books_add', parm);
            } else {
                res.redirect("/admin/books");
            }
        })
    } catch (err) {
        var parm = { user: user, err: err };
        res.render('admin/books_add', parm);
    }
});

router.get('/up', function(req, res, next) {
    var user = req.cookies.songbei_admin_user;
    try {
        if (!user) {
            res.redirect("/admin/login");
            return;
        }
        homeDao.queryHome(function(err, result) {
            if (err) {
                res.render('admin/home', { user: user, err: err, obj: null });
            } else {
                if (result.length > 0) {
                    console.log(result[0])
                    res.render('admin/home_up', { user: user, err: null, obj: result[0] });
                } else {
                    res.render('admin/home_up', { user: user, err: null, obj: { id: 0, home_config: '' } });
                }
            }
        });
    } catch (err) {
        var parm = { user: user, err: err };
        res.render('admin/home_up', parm);
    }
});

router.post('/up', multipartMiddleware, function(req, res, next) {
    var user = req.cookies.songbei_admin_user;
    try {
        if (!user) {
            res.redirect("/admin/login");
            return;
        }
        var body = req.body;
        var parm = { user: user, err: null, obj: body };
        console.log(body)
        var id = body.id;
        var home_config = body.home_config;
        if (!id || !home_config) {
            parm.err = new Error('参数错误')
            res.render('admin/home_up', parm);
            return;
        }
        home_config = JSON.parse(home_config);
        home_config = JSON.stringify(home_config);
        console.log(home_config)
        if (parseInt(id) == 0) {
            console.log('-------addHomeConfig')
            homeDao.addHomeConfig(home_config, function(err, result) {
                if (err) {
                    console.error(err);
                    parm.err = err;
                    res.render('admin/home_up', parm);
                } else {
                    console.error(result);
                    res.redirect("/admin/home");
                }
            });
        } else {
            console.log('-------upHomeConfig')
            homeDao.upHomeConfig(id,home_config, function(err, result) {
                if (err) {
                    console.error(err);
                    parm.err = err;
                    res.render('admin/home_up', parm);
                } else {
                    console.error(result);
                    res.redirect("/admin/home");
                }
            });
        }
    } catch (err) {
        console.log(err);
        var parm = { user: user, err: err, };
        res.render('admin/books_up', parm);
    }

});



module.exports = router;