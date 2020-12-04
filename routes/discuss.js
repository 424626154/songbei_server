/**
 * 讨论
 */
var _roomdir = "../";
var logger = require(_roomdir + 'utils/log4jsutil').logger(__dirname + '/discuss.js');
var express = require('express');
var router = express.Router();
var utils = require(_roomdir + 'utils/utils');
var httputil = require(_roomdir + 'utils/httputil');
var ru = require(_roomdir + 'utils/routersutil');
var { AddDiscussExtend, DLoveExtend, DCommentExtend, Message, MessageType } = require(_roomdir + 'models/models');
var appconfig = require(_roomdir + 'conf/appconfig');

var webhook = require(_roomdir + 'webhook/webhook');

/*---db---*/
var dbDao = require(_roomdir + 'daos/dbDaos');
var userDao = dbDao.userDao;
var discussDao = dbDao.discussDao;


router.get('/', function(req, res, next) {
    res.send('discuss');
})
/**
 * 添加帖子
 */

router.post('/add', function(req, res, next) {
    try {
        ru.logReq(req);
        var userid = req.body.userid;
        var title = req.body.title;
        var content = req.body.content;
        var extend = req.body.extend;
        var type = req.body.type;
        var os = req.body.os;
        if (!content || !userid ) {
            ru.resError(res, '参数错误');
        } else {
            discussDao.addDiscuss(userid, type, title, content, extend, function(err, result) {
                if (err) {
                    ru.resError(res, err);
                } else {
                    var poem = {};
                    if (result.length > 0) {
                        poem = result[0];
                    }
                    var push_title = utils.getPushTitle(poem.content);
                    ru.resSuccess(res, poem);
                    // console.log(poem)
                    userDao.queryFollowMe(userid, function(err, result) {
                        if (err) {
                            logger.error(err);
                        } else {
                            if (result.length > 0) {
                                let messages = [];
                                console.log('--------------')
                                console.log(result);
                                for (var i = 0; i < result.length; i++) {
                                    var title = poem.nickname + '发布了新帖子';
                                    var content = poem.nickname + '发布了[' + push_title + ']';
                                    var addDiscussExtend = new AddDiscussExtend(poem.id, poem.userid, poem.head, poem.nickname, poem.title);
                                    var message = new Message(MessageType.DADD, result[i].fansid, title, content, addDiscussExtend);
                                    messages.push(message)
                                }
                                if (messages.length > 0) {
                                    httputil.requstLocalPost('/message/actionmsgs', { messages: messages }, function(err, result) {
                                        logger.debug(err);
                                        logger.debug(result);
                                    });
                                }

                                var app_name = appconfig.APP_NAME;
                                var webhook_body = "####" + app_name + "\n用户:" + userid + "发布了新的帖子[" + push_title + "]"
                                    +"\n系统:["+os+"]";
                                webhook.sendMarkdownMsg(webhook_body, function(err, result) {
                                    if (err) {
                                        logger.error(err);
                                    }
                                });
                            }
                        }
                    })
                }
            })
        }
    } catch (err) {
        ru.resError(res, err.message);
    }
});

router.post('/addclassify', function(req, res, next) {
    try {
        ru.logReq(req);
        var body = req.body;
        var userid = body.userid;
        var title = body.title;
        var content = body.content;
        var extend = body.extend;
        var type = body.type;
        var os = body.os;
        var c_type = body.c_type;
        var ciid = body.ciid;
        console.log(type)
        console.log(!type)
        if (!content || !userid ||!c_type||!ciid) {
            ru.resError(res, '参数错误');
        } else {
            discussDao.addClassifyDiscuss(userid, type, c_type,ciid,title, content, extend, function(err, result) {
                if (err) {
                    ru.resError(res, err);
                } else {
                    var poem = {};
                    if (result.length > 0) {
                        poem = result[0];
                    }
                    var push_title = utils.getPushTitle(poem.content);
                    ru.resSuccess(res, poem);
                    console.log(poem)
                    userDao.queryFollowMe(userid, function(err, result) {
                        if (err) {
                            logger.error(err);
                        } else {
                            if (result.length > 0) {
                                let messages = [];
                                console.log('--------------')
                                console.log(result);
                                for (var i = 0; i < result.length; i++) {
                                    var title = poem.nickname + '发布了新帖子';
                                    var content = poem.nickname + '发布了[' + push_title+ ']';
                                    var addDiscussExtend = new AddDiscussExtend(poem.id, poem.userid, poem.head, poem.nickname, poem.title);
                                    var message = new Message(MessageType.DADD, result[i].fansid, title, content, addDiscussExtend);
                                    messages.push(message)
                                }
                                if (messages.length > 0) {
                                    httputil.requstLocalPost('/message/actionmsgs', { messages: messages }, function(err, result) {
                                        logger.debug(err);
                                        logger.debug(result);
                                    });
                                }

                                var app_name = appconfig.APP_NAME;
                                var webhook_body = "####" + app_name + "\n用户:" + userid + "发布了新的帖子[" + push_title + "]"
                                    +"\n系统:["+os+"]";
                                webhook.sendMarkdownMsg(webhook_body, function(err, result) {
                                    if (err) {
                                        logger.error(err);
                                    }
                                });
                            }
                        }
                    })
                }
            })
        }
    } catch (err) {
        ru.resError(res, err.message);
    }
});
/**
 * 删除作品
 */
router.post('/del', function(req, res, next) {
    ru.logReq(req);
    var userid = req.body.userid;
    var id = req.body.id;
    if (!id || !userid) {
        ru.resError(res, '参数错误');
    } else {
        discussDao.delDiscuss(id, userid, function(err, result) {
            if (err) {
                ru.resError(res, err);
            } else {
                var poem = { id: parseInt(id), userid: userid };
                ru.resSuccess(res, poem);
            }
        })
    }
});
/**
 * 作品详情
 */
router.post('/info', function(req, res, next) {
    ru.logReq(req);
    var id = req.body.id;
    var userid = req.body.userid;
    if (!id) {
        ru.resError(res, '参数错误')
    } else {
        discussDao.queryDiscussInfo(id, userid, function(err, result) {
            if (err) {
                ru.resError(res, err)
            } else {
                if (result.del == 1) {
                    ru.resError(res, '作品已删除')
                } else {
                    ru.resSuccess(res, result);
                }
            }
        });
    }
});



router.post('/mydiscuss', function(req, res, next) {
    ru.logReq(req);
    var userid = req.body.userid;
    if (!userid) {
        ru.resError(res, '参数错误');
    } else {
        discussDao.queryMyDiscuss(userid, function(err, poems) {
            if (err) {
                logger.error(err);
                ru.resError(res, err);
            } else {
                ru.resSuccess(res, poems);
            }
        })
    }
});
/**
 * 我的最新讨论
 */
router.post('/nmydiscuss', function(req, res, next) {
    ru.logReq(req);
    var userid = req.body.userid;
    var id = req.body.id;
    if (!userid) {
        ru.resError(res, '参数错误');
    } else {
        discussDao.queryNMyDiscuss(userid, id, function(err, poems) {
            if (err) {
                logger.error(err);
                ru.resError(res, err);
            } else {
                ru.resSuccess(res, poems);
            }
        })
    }
});
/**
 * 我的历史讨论
 */
router.post('/hmydiscuss', function(req, res, next) {
    ru.logReq(req)
    var userid = req.body.userid;
    var id = req.body.id;
    if (!userid) {
        resError(res, '参数错误');
    } else {
        discussDao.queryHMyDiscuss(userid, id, function(err, poems) {
            if (err) {
                ru.resError(res, err);
            } else {
                ru.resSuccess(res, poems);
            }
        });
    }
});
/**
 * 最新帖子
 */
router.post('/ndiscuss', function(req, res, next) {
    try {
        ru.logReq(req);
        var id = req.body.id;
        var userid = req.body.userid;
        discussDao.queryNDiscuss(id, userid, function(err, poems) {
            if (err) {
                ru.resError(res, err);
            } else {
                ru.resSuccess(res, poems);
            }
        })
    } catch (err) {
        ru.resError(res, err.message);
    }
});
/**
 * 历史帖子
 */
router.post('/hdiscuss', function(req, res, next) {
    try {
        ru.logReq(req);
        var id = req.body.id;
        var userid = req.body.userid;
        discussDao.queryHDiscuss(id, userid, function(err, poems) {
            if (err) {
                ru.resError(res, err);
            } else {
                ru.resSuccess(res, poems);
            }
        });
    } catch (err) {
        ru.resError(res, err.message);
    }
});

/**
 * 分栏帖子
 */
router.post('/cdiscuss', function(req, res, next) {
    try {
        ru.logReq(req);
        var body = req.body;
        var id = body.id;
        var userid = body.userid;
        var c_type = body.c_type;
        var ciid = body.ciid;
        discussDao.queryCDiscuss(id, userid, c_type, ciid, function(err, poems) {
            if (err) {
                ru.resError(res, err);
            } else {
                ru.resSuccess(res, poems);
            }
        })
    } catch (err) {
        ru.resError(res, err.message);
    }
});

router.post('/home', function(req, res, next) {
    try {
        ru.logReq(req);
        var body = req.body;
        var id = body.id;
        var userid = body.userid;
        var c_type = body.c_type;
        discussDao.queryHomeDiscuss(id, userid, c_type, function(err, poems) {
            if (err) {
                ru.resError(res, err);
            } else {
                ru.resSuccess(res, poems);
            }
        })
    } catch (err) {
        ru.resError(res, err.message);
    }
});



/**
 * 点赞
 */
router.post('/love', function(req, res, next) {
    ru.logReq(req);
    var id = req.body.id;
    var userid = req.body.userid;
    var love = req.body.love;
    var time = utils.getTime();
    if (!id || !userid) {
        ru.resError(res, '参数错误');
        return;
    }
    discussDao.queryDiscuss(id, function(err, result) {
        if (err) {
            ru.resError(res, err);
        } else {
            if (result.length > 0) {
                discussDao.loveDiscuss(id, userid, love, function(err, love) {
                    if (err) {
                        ru.resError(res, err);
                    } else {
                        if (love.love == 1) {
                            discussDao.queryOpDiscuss(id, userid, function(err, poem) {
                                if (userid != poem.userid) { //自己点赞自己不发消息
                                    var title = '有人赞了你的讨论';
                                    var content = poem.opnickname + '赞了[' + poem.title + ']';
                                    var loveExtend = new DLoveExtend(poem.title, poem.opuser, poem.ophead, poem.opnickname, id);
                                    var message = new Notice(NoticeType.DLOVE, poem.userid, title, content, loveExtend);
                                    httputil.requstLocalPost('/psbook/message/actionmsg', message, function(err, result) {
                                        logger.debug(err);
                                        logger.debug(result);
                                    });
                                }
                            });
                        }
                        ru.resSuccess(res, love);
                    }
                });
            } else {
                ru.resError(res, '作品不存在或者已经被删除！');
            }
        }
    })
});
/**
 * 获取点赞列表
 */
router.post('/loves', function(req, res, next) {
    ru.logReq(req);
    var pid = req.body.id;
    if (!pid) {
        resError(res, '参数错误')
    } else {
        discussDao.queryLoves(pid, function(err, result) {
            if (err) {
                ru.resError(res, err)
            } else {
                ru.resSuccess(res, result);
            }
        });
    }
});




module.exports = router;

