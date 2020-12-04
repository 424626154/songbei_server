var _roomdir = "../";
var logger = require(_roomdir + 'utils/log4jsutil').logger(__dirname + '/comment.js');
var express = require('express');
var router = express.Router();
var ru = require(_roomdir + 'utils/routersutil');
var httputil = require(_roomdir + 'utils/httputil');
var utils = require(_roomdir + 'utils/utils');
var { DCommentExtend, Message, MessageType } = require(_roomdir + 'models/models');
var { CommentType } = require(_roomdir + 'daos/dbEnums')
/*---db---*/
var dbDao = require(_roomdir + 'daos/dbDaos');
var commentDao = dbDao.commentDao;
var discussDao = dbDao.discussDao;

function sendCommentNotice(id, cid, userid, comment_str) {
    discussDao.queryOpDiscuss(id, userid, function(err, item) {
        if (err) {
            logger.error(err);
            return;
        }
        if (userid != item.userid) { //自己点赞自己不发消息
            var op_srt = '评论';
            if (cid > 0) {
                op_srt = '回复';
            }
            var title = '有人' + op_srt + '了你的讨论';
            var content = item.opnickname + op_srt + ':' + comment_str;
            var commentExtend = new DCommentExtend(item.title, item.opuser,
                item.ophead, item.opnickname, id, cid, comment_str);
            var message = new Message(MessageType.DCOMMENT, item.userid, title, content, commentExtend);
            httputil.requstLocalPost('/message/actionmsg', message, function(err, result) {
                logger.debug(err);
                logger.debug(result);
            });
            if (cid > 0) {
                commentDao.queryCommentFId(cid, function(err, result) {
                    if (err) {
                        logger.error(err);
                    } else {
                        var comment_userid = result.length > 0 ? result[0].userid : 0;
                        if (comment_userid && comment_userid != userid && comment_userid != item.userid) { // 屏蔽回复自己跟作者本身
                            title = '有人' + op_srt + '了[' + item.title + ']';
                            var message1 = new Message(MessageType.DCOMMENT, comment_userid, title, content, commentExtend);
                            httputil.requstLocalPost('/message/actionmsg', message1, function(err, result) {
                                logger.debug(err);
                                logger.debug(result);
                            });
                        }
                    }
                });
            }
        }
    });
}

/**
 * 评论作品
 */
router.post('/add', function(req, res, next) {
    try {
        ru.logReq(req);
        var type = req.body.type || 0;
        var id = req.body.id;
        var userid = req.body.userid;
        var cid = req.body.cid;
        var comment_str = req.body.comment;
        if (!id || !type || !userid || !comment_str) {
            ru.resError(res, '参数错误');
        } else {
            commentDao.queryCount(id, type, function(err, count) {
                if (err) {
                    ru.resError(res, res);
                } else {
                    if (count > 0) {
                        commentDao.addComment(id, type, userid, cid, comment_str, function(err, comment) {
                            if (err) {
                                ru.resError(res, err);
                            } else {
                                ru.resSuccess(res, comment);
                            }
                        })
                        commentDao.addCommentNum(id, type, function(err, comment) {})
                        //发送通知
                        sendCommentNotice(id, cid, userid, comment_str);
                    } else {
                        ru.resError(res, '作品不存在或者已经被删除！');
                    }
                }
            });
        }
    } catch (err) {
        ru.resError(res, err.message);
    }
});

router.post('/addv2', function(req, res, next) {
    try {
        ru.logReq(req);
        var body = req.body;
        var type = req.body.type || 0;
        var id = req.body.id;
        var userid = req.body.userid;
        var cid = req.body.cid;
        var cuserid = req.body.cuserid;
        var chead = req.body.chead;
        var cnickname = req.body.cnickname;
        var comment_str = req.body.comment;
        if (!id || !type || !userid || !comment_str) {
            ru.resError(res, '参数错误');
        } else {
            commentDao.addCommentV2(id, type, userid, cid, cuserid,comment_str, function(err, result) {
                if (err) {
                    ru.resError(res, err);
                } else {
                    var comment = body;
                    comment.id = result.insertId;
                    comment.time = utils.getTime();
                    ru.resSuccess(res, comment);
                }
            })
        }
    } catch (err) {
        ru.resError(res, err.message);
    }
});
/**
 * 删除评论
 */
router.post('/del', function(req, res, next) {
    try {
        ru.logReq(req);
        var type = req.body.type;
        var userid = req.body.userid;
        var id = req.body.id;
        var iid = req.body.iid;
        if (!id || !type || !iid || !userid) {
            ru.resError(res, '参数错误');
        } else {
            commentDao.delComment(id, type, userid, function(err, result) {
                if (err) {
                    ru.resError(res, err);
                } else {
                    commentDao.reduceCommentNum(iid, type, function(err, comment) {})
                    var item = { id: parseInt(id), userid: userid };
                    ru.resSuccess(res, item);
                }
            })
        }
    } catch (err) {
        ru.resError(res, err.message);
    }

});

router.post('/delv2', function(req, res, next) {
    try {
        ru.logReq(req);
        var type = req.body.type;
        var userid = req.body.userid;
        var id = req.body.id;
        if (!id || !type || !userid) {
            ru.resError(res, '参数错误');
        } else {
            commentDao.delComment(id, type, userid, function(err, result) {
                if (err) {
                    ru.resError(res, err);
                } else {
                    var item = { id: parseInt(id), userid: userid };
                    ru.resSuccess(res, item);
                }
            })
        }
    } catch (err) {
        ru.resError(res, err.message);
    }

});

/**
 * 最新评论
 */
router.post('/latest', function(req, res, next) {
    try {
        ru.logReq(req);
        try {
            var id = req.body.id;
            var iid = req.body.iid;
            var type = req.body.type;
            if (!iid || !type) {
                ru.resError(res, '参数错误');
            } else {
                commentDao.queryLatest(id, iid, type, function(err, comments) {
                    if (err) {
                        ru.resError(res, err);
                    } else {
                        ru.resSuccess(res, comments);
                    }
                })
            }
        } catch (err) {
            ru.resError(res, err.message);
        }
    } catch (err) {
        ru.resError(res, err.message);
    }
});
/**
 * 历史评论
 */
router.post('/history', function(req, res, next) {
    try {
        ru.logReq(req);
        var id = req.body.id;
        var iid = req.body.iid;
        var type = req.body.type;
        if (!iid || !type) {
            resError(res, '参数错误');
        } else {
            commentDao.queryHistory(id, iid, type, function(err, comments) {
                if (err) {
                    logger.error(err)
                    ru.resError(res, err);
                } else {
                    ru.resSuccess(res, comments);
                }
            })
        }
    } catch (err) {
        ru.resError(res, err.message);
    }
});

module.exports = router;