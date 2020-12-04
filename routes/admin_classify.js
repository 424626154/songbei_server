var _roomdir = "../";
var logger = require(_roomdir + 'utils/log4jsutil').logger(__dirname + '/admin/classify.js');
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
var homeClassifyDao = daos.homeClassifyDao

router.get('/', function(req, res, next) {
    try {
        var user = req.cookies.songbei_admin_user;
        if (!user) {
            res.redirect("/admin/login");
            return;
        }
        var cur_page = req.query.cur_page;
        cur_page = cur_page ? cur_page : 1;
        var parm = { user: user, err: null, objs: [], page: null };
        homeClassifyDao.queryAPage(cur_page, function(err, result) {
            if (err) {
                parm.err = err
                console.error(err);
            } else {
                parm.objs = result.items
                parm.page = result.page
                console.log(result.items);
            }
            res.render('admin/classify', parm);
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
            homeClassifyDao.updateState(id, 1, function(err, result) {
                if (err) {
                    ru.resError(res, err)
                } else {
                    state = 1;
                    ru.resSuccess(res, { op: op, state: state, id: id });
                }
            });
            return;
        } else if (op == 'state0') {
            homeClassifyDao.updateState(id, 0, function(err, result) {
                if (err) {
                    ru.resError(res, err)
                } else {
                    state = 0;
                    ru.resSuccess(res, { op: op, state: state, id: id });
                }
            });
            return;
        } else if (op == 'del') {
            homeClassifyDao.delClassify(id, function(err, result) {
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
        res.render('admin/classify_add', parm);
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
        var title = body.title;
        var brief = body.brief;
        var logo = body.logo;
        var type = body.ctype;
        if (!title || !brief || !logo || !type) {
            parm.err = new Error('参数错误')
            res.render('admin/classify_add', parm);
            return;
        }
        homeClassifyDao.addClassify(title, brief, logo, type, function(err, result) {
            if (err) {
                console.error(err);
                parm.err = err;
                res.render('admin/classify_add', parm);
            } else {
                res.redirect("/admin/classify");
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
        var id = req.query.id;
        if (id) {
            homeClassifyDao.queryAdminClassify(id, function(err, result) {
                if (err) {
                    res.render('admin/classify', { user: user, err: err, obj: null });
                } else {
                    if (result.length > 0) {
                        console.log(result[0])
                        res.render('admin/classify_up', { user: user, err: null, obj: result[0] });
                    } else {
                        res.render('admin/classify_up', { user: user, err: new Error('ID错误'), obj: null });
                    }
                }
            })
        } else {
            res.render('admin/classify_up', { user: user, err: new Error('参数错误'), obj: null });
        }
    } catch (err) {
        var parm = { user: user, err: err, obj: null };
        res.render('admin/classify_up', parm);
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
        var title = body.title;
        var brief = body.brief;
        var logo = body.logo;
        var type = body.ctype;
        if (!id || !title || !brief || !logo || !type) {
            parm.err = new Error('参数错误')
            res.render('admin/classify_up', parm);
            return;
        }
        homeClassifyDao.upClassify(id, title, brief, logo, type, function(err, result) {
            if (err) {
                console.error(err);
                parm.err = err;
                res.render('admin/classify_up', parm);
            } else {
                console.error(result);
                res.redirect("/admin/classify");
            }
        });
    } catch (err) {
        var parm = { user: user, err: err };
        res.render('admin/classify_up', parm);
    }

});

router.post('/ctype', function(req, res, next) {
    try {
        var ctype = [{
                name: '景点',
                value: 'scenic_spot'
            },
            {
                name: '高校',
                value: 'university'
            },
            {
                name: '二手物品',
                value: 'secondhand'
            },
            {
                name: '婚恋交友',
                value: 'dating'
            }
        ]
        ru.resSuccess(res, ctype);
    } catch (err) {
        console.error(err);
        ru.resError(res, err.message);
    }
});


router.get('/item', function(req, res, next) {
    try {
        var user = req.cookies.songbei_admin_user;
        if (!user) {
            res.redirect("/admin/login");
            return;
        }
        var cur_page = req.query.cur_page;
        cur_page = cur_page ? cur_page : 1;
        var parm = { user: user, err: null, objs: [], page: null };
        homeClassifyDao.queryAItemPage(cur_page, function(err, result) {
            if (err) {
                parm.err = err
                console.error(err);
            } else {
                parm.objs = result.items
                parm.page = result.page
                console.log(result.items);
            }
            res.render('admin/classify_item', parm);
        })
    } catch (err) {
        console.error(err);
        // res.redirect("/admin/login");
    }
});

router.post('/item', function(req, res, next) {
    try {
        ru.logReq(req);
        var body = req.body;
        var op = body.op;
        var id = body.id;
        console.log(id)
        var state = 0;
        if (op == 'state1') {
            homeClassifyDao.updateItemState(id, 1, function(err, result) {
                if (err) {
                    ru.resError(res, err)
                } else {
                    state = 1;
                    ru.resSuccess(res, { op: op, state: state, id: id });
                }
            });
            return;
        } else if (op == 'state0') {
            homeClassifyDao.updateItemState(id, 0, function(err, result) {
                if (err) {
                    ru.resError(res, err)
                } else {
                    state = 0;
                    ru.resSuccess(res, { op: op, state: state, id: id });
                }
            });
            return;
        } else if (op == 'del') {
            homeClassifyDao.delItemClassify(id, function(err, result) {
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

router.get('/additem', function(req, res, next) {
    try {
        var user = req.cookies.songbei_admin_user;
        if (!user) {
            res.redirect("/admin/login");
            return;
        }
        var parm = { user: user, err: null };
        res.render('admin/classify_item_add', parm);
    } catch (err) {
        // console.error(err);
        res.redirect("/admin/login");
    }
});


router.post('/additem', multipartMiddleware, function(req, res, next) {
    var user = req.cookies.songbei_admin_user;
    try {
        var parm = { user: user, err: null };
        var body = req.body;
        console.log(body)
        var title = body.title;
        var brief = body.brief;
        var logo = body.logo;
        var cid = body.ctype;
        if (!cid||!title || !brief || !logo) {
            parm.err = new Error('参数错误')
            res.render('admin/classify_item_add', parm);
            return;
        }
        homeClassifyDao.addClassifyItem(title, brief, logo, cid, function(err, result) {
            if (err) {
                console.error(err);
                parm.err = err;
                res.render('admin/classify_item_add', parm);
            } else {
                res.redirect("/admin/classify/item");
            }
        })
    } catch (err) {
        var parm = { user: user, err: err };
        res.render('admin/classify_item_add', parm);
    }
});



router.get('/upitem', function(req, res, next) {
    var user = req.cookies.songbei_admin_user;
    try {
        if (!user) {
            res.redirect("/admin/login");
            return;
        }
        var id = req.query.id;
        if (id) {
            homeClassifyDao.queryAdminClassifyItem(id, function(err, result) {
                if (err) {
                    res.render('admin/classify', { user: user, err: err, obj: null });
                } else {
                    if (result.length > 0) {
                        console.log(result[0])
                        res.render('admin/classify_item_up', { user: user, err: null, obj: result[0] });
                    } else {
                        res.render('admin/classify_item_up', { user: user, err: new Error('ID错误'), obj: null });
                    }
                }
            })
        } else {
            res.render('admin/classify_item_up', { user: user, err: new Error('参数错误'), obj: null });
        }
    } catch (err) {
        var parm = { user: user, err: err, obj: null };
        res.render('admin/classify_item_up', parm);
    }
});

router.post('/upitem', multipartMiddleware, function(req, res, next) {
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
        var title = body.title;
        var brief = body.brief;
        var logo = body.logo;
        var cid = body.ctype;
        if (!id || !title || !brief || !logo || !cid) {
            parm.err = new Error('参数错误')
            res.render('admin/classify_item_up', parm);
            return;
        }
        homeClassifyDao.upClassifyItem(id, title, brief, logo, cid, function(err, result) {
            if (err) {
                console.error(err);
                parm.err = err;
                res.render('admin/classify_item_up', parm);
            } else {
                console.error(result);
                res.redirect("/admin/classify_item");
            }
        });
    } catch (err) {
        var parm = { user: user, err: err };
        res.render('admin/classify_item_up', parm);
    }

});

router.post('/cidtype', function(req, res, next) {
    try {
        homeClassifyDao.queryClassify(function(err, result) {
            if (err) {
                ru.resError(res, err);
            } else {
                console.log(result);
                ru.resSuccess(res, result);
            }
        });
    } catch (err) {
        console.error(err);
        ru.resError(res, err.message);
    }
});

module.exports = router;