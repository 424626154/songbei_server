/**
 * 用户服务器
 */
var _roomdir = "../";
var express = require('express');
var router = express.Router();
var http = require('http');
var utils = require(_roomdir + 'utils/utils');
var httputil = require(_roomdir + 'utils/httputil');
var alisms = require(_roomdir + 'utils/alisms');
var ru = require(_roomdir + 'utils/routersutil');
var logger = require(_roomdir + 'utils/log4jsutil').logger(__dirname + '/user.js');
var { FollowExtend, Message, MessageType } = require(_roomdir + 'models/models');
var jpush = require(_roomdir + 'push/fcm');
var conf_validate = require(_roomdir + 'conf/config').server.validate;
var conf_sms = require(_roomdir + 'conf/config').server.sms;
var deftext = require(_roomdir + 'conf/deftext');
logger.info(conf_validate)

/******db*****/
var dbDaos = require(_roomdir + 'daos/dbDaos');
var validateDao = dbDaos.validateDao;
var userDao = dbDaos.userDao;
var reportDao = dbDaos.reportDao;
var blacklistDao = dbDaos.blacklistDao;

// logger.info(deftext)
/* GET user listing. */
router.get('/', function(req, res, next) {
    //res.send('respond with a resource');
    try {
        res.send('user');
    } catch (err) {
        ru.resError(res, err.message);
    }
});

function sendCodeSms(type, phone, code, callback) {
    logger.info('---发送短信验证码 type:' + type + ' phone:' + phone + ' code:' + code);
    if (conf_sms == 'jpush') {
        jpush.sendCodeSms(phone, code, function(err, result) {
            if (!err) {
                logger.info(err)
                userDao.updateJPushSms(phone, type, result.msg_id, function(err, result) {

                })
            } else {
                logger.error(err)
            }
            callback(err, result)
        });
        // jpush.sendTemplates(callback);
    } else if (conf_sms == 'ali') {
        alisms.sendAliSms(phone, code, function(err, result) {
            if (!err) {
                logger.info(err)
                userDao.updateAliSms(phone, type, result.RequestId, result.BizId, function(err, result) {

                })
            } else {
                logger.error(err)
            }
            callback(err, result)
        })
    } else {
        callback(conf_sms, '')
    }
}

/**
 * 登录
 */
router.post('/login', function(req, res, next) {
    try {
        ru.logReq(req);
        var phone = req.body.phone;
        var password = req.body.password;
        var os = req.body.os;
        userDao.queryUser(phone, function(err, users) {
            if (err) {
                ru.resError(res, err);
            } else {
                var length = users.length;
                if (length > 0) {
                    var user = users[0];
                    if (user.password == password) {
                        if (user.os != os) {
                            userDao.updateUserOs(user.userid, os, function(err, result) {

                            })
                        }
                        ru.resSuccess(res, user);
                    } else {
                        ru.resError(res, '密码错误');
                    }
                } else {
                    ru.resError(res, '用户未注册');
                }
            }
        })
    } catch (err) {
        ru.resError(res, err.message);
    }
});
router.post('/logout', function(req, res, next) {
    try {
        ru.logReq(req);
        var userid = req.body.userid;
        if (!userid) {
            ru.resError(res, '参数错误');
            return;
        }
        var push = {
            userid: userid,
        }
        httputil.requstLocalPost('/message/pushid', push, function(err, result) {
            if (err) {
                ru.resError(res, '参数错误');
            } else {
                ru.resSuccess(res, { userid: userid });
            }
        });
    } catch (err) {
        ru.resError(res, err.message);
    }
});
/**
 * 请求验证码
 */
router.post('/validate', function(req, res, next) {
    try {
        ru.logReq(req);
        var phone = req.body.phone;
        var country_code = req.body.country_code;
        var type = req.body.type;
        if (!phone || !type || !country_code) {
            ru.resError(res, '参数错误');
        } else if (!utils.checkPhone(phone)) {
            ru.resError(res, '请填写正确的手机号格式');
        } else {
            var max_time = 60; //秒级
            validateDao.queryValidate(country_code, phone, type, function(err, objs) {
                if (err) {
                    ru.resError(res, err.code);
                } else {
                    logger.debug('验证码已经存在')
                    var length = objs.length;
                    if (length > 0) {
                        var validate = objs[0];
                        var current_time = utils.getTime();
                        var current_date_time = utils.getDateTime();
                        var diff_time = current_time - validate.time
                        if (diff_time >= max_time) {
                            //重新生成
                            logger.debug('重新生成验证码')
                            var code = utils.getCode();
                            validateDao.updateValidate(country_code, phone, type, code, current_date_time, function(err, objs) {
                                if (err) {
                                    ru.resError(res, err.code);
                                } else {
                                    var data = { phone: phone, type: type, code: code, time: max_time, max: max_time };
                                    ru.resSuccess(res, data)
                                    logger.debug('------验证码为:' + code + '------')
                                    var new_phone = utils.fromCountryCode(country_code, phone);
                                    sendCodeSms(type, new_phone, code, function(err, sms) {

                                    })
                                }
                            })
                        } else {
                            validate.time = max_time - diff_time;
                            validate.max = max_time,
                                logger.debug('------验证码为:' + validate.code + '------')
                            ru.resSuccess(res, validate);
                        }
                    } else {
                        logger.debug('初始生成验证码')
                        //生成
                        var code = utils.getCode();
                        var current_time = utils.getDateTime();
                        validateDao.addValidate(country_code, phone, type, code, current_time, function(err, objs) {
                            logger.debug(err)
                            if (err) {
                                ru.resError(res, err.code);
                            } else {
                                logger.debug('初始生成验证码/ali/sendcode3')
                                var validate = {
                                    phone: phone,
                                    code: code,
                                    time: max_time,
                                    max: max_time,
                                    type: type,
                                }
                                console.log('------验证码为:' + code + '------')
                                ru.resSuccess(res, validate);
                                var new_phone = utils.fromCountryCode(country_code, phone);
                                sendCodeSms(type, new_phone, code, function(err, data) {

                                })
                            }
                        })
                    }
                }
            })
        }
    } catch (err) {
        ru.resError(res, err.message);
    }
});
/**
 * 注册
 */
router.post('/register', function(req, res, next) {
    try {
        ru.logReq(req);
        var country_code = req.body.country_code;
        var phone = req.body.phone;
        var password = req.body.password;
        var code = req.body.code;
        var os = req.body.os;
        var userid = utils.getUserid(phone);
        if (!phone || !password || !code || !country_code) {
            ru.resError(res, '参数错误!');
        } else if (!utils.checkPhone(phone)) {
            ru.resError(res, '请填写正确的手机号格式');
        } else {
            userDao.queryUser(phone, function(err, result) {
                if (err) {
                    ru.resError(res, err)
                } else {
                    if (result.length > 0) {
                        ru.resError(res, '用户已经注册')
                    } else {
                        if (conf_validate) {
                            validateDao.queryValidate(country_code, phone, 1, function(err, objs) {
                                if (err) {
                                    ru.resError(res, err);
                                } else {
                                    var length = objs.length;
                                    if (length > 0) {
                                        var validate = objs[0];
                                        if (validate.phone == phone && validate.code == code) {
                                            userDao.addUser(userid, country_code, phone, password, os, function(err, result) {
                                                if (err) {
                                                    ru.resError(res, err);
                                                } else {
                                                    var title = deftext.register_title;
                                                    var content = deftext.register_content;
                                                    var data = {
                                                        type: 0,
                                                        userid: userid,
                                                        title: title,
                                                        content: content,
                                                        extend: {},
                                                    };
                                                    httputil.requstLocalPost('/message/actionmsg', data, function(err, result) {
                                                        if (err) {
                                                            logger.error(err)
                                                        }
                                                    })
                                                    var user = result.length > 0 ? result[0] : {};
                                                    ru.resSuccess(res, user);
                                                }
                                            });
                                        } else {
                                            ru.resError(res, '验证码错误');
                                        }
                                    } else {
                                        ru.resError(res, '验证码错误');
                                    }
                                }
                            });
                        } else {
                            userDao.addUser(userid, country_code, phone, password, os, function(err, result) {
                                if (err) {
                                    ru.resError(res, err);
                                } else {
                                    var title = deftext.register_title;
                                    var content = deftext.register_content;
                                    var data = {
                                        type: 0,
                                        userid: userid,
                                        title: title,
                                        content: content,
                                        extend: {},
                                    };
                                    httputil.requstPSPost('/message/actionmsg', data, function(err, result) {
                                        if (err) {
                                            logger.error(err)
                                        }
                                    })
                                    var user = result.length > 0 ? result[0] : {};
                                    ru.resSuccess(res, user);
                                }
                            });
                        }
                    }
                }
            });
        }
    } catch (err) {
        ru.resError(res, err.message);
    }
});

router.post('/forget', function(req, res, next) {
    try {
        ru.logReq(req);
        var country_code = req.body.country_code;
        var phone = req.body.phone;
        var password = req.body.password;
        var code = req.body.code;
        // var os = req.body.os;
        // var userid = utils.getUserid(phone);
        if (!phone || !password || !code || !country_code) {
            ru.resError(res, '参数错误');
        } else {
            userDao.queryUser(phone, function(err, result) {
                if (err) {
                    ru.resError(res, err)
                } else {
                    if (result.length > 0) {
                        if (conf_validate) {
                            validateDao.queryValidate(country_code, phone, 2, function(err, objs) {
                                if (err) {
                                    ru.resError(res, err);
                                } else {
                                    var length = objs.length;
                                    if (length > 0) {
                                        var validate = objs[0];
                                        if (validate.phone == phone && validate.code == code) {
                                            userDao.updateUserPwd(phone, password, function(err, result) {
                                                if (err) {
                                                    ru.resError(res, err);
                                                } else {
                                                    var data = {
                                                        phone: phone,
                                                        passwrod: password,
                                                    }
                                                    ru.resSuccess(res, data);
                                                }
                                            });
                                        } else {
                                            ru.resError(res, '验证码错误');
                                        }
                                    } else {
                                        ru.resError(res, '验证码错误');
                                    }
                                }
                            });
                        } else {
                            userDao.updateUserPwd(phone, password, function(err, result) {
                                if (err) {
                                    ru.resError(res, err);
                                } else {
                                    var data = {
                                        phone: phone,
                                        passwrod: password,
                                    }
                                    ru.resSuccess(res, data);
                                }
                            });
                        }
                    } else {
                        ru.resError(res, '用户未注册')
                    }
                }
            });
        }
    } catch (err) {
        ru.resError(res, err.message);
    }

});
/**
 * 修改用户信息
 */
router.post('/upinfo', function(req, res, next) {
    try {
        ru.logReq(req);
        var body = req.body;
        var userid = body.userid;
        var nickname = body.nickname;
        var head = body.head;
        var gender = body.gender;
        var birth_date = body.birth_date;
        var profile = body.profile;
        if (!userid) {
            ru.resError(res, '参数错误')
            return;
        }
        userDao.upUser(userid, nickname, head, gender, birth_date, profile, function(err, result) {
            if (err) {
                ru.resError(res, err);
                return;
            }
            userDao.queryUserInfo(userid, function(err, result) {
                if (err) {
                    ru.resError(res, err);
                    return;
                }
                console.log(result)
                var user = {};
                if (result.length > 0) {
                    user = result[0][0];
                    user.myfollow = result[1][0].count;
                    user.followme = result[2][0].count;
                }
                ru.resSuccess(res, user);
            })
        })
    } catch (err) {
        ru.resError(res, err.message);
    }

});

/**
 * 获取用户信息
 */
router.post('/info', function(req, res, next) {
    try {
        ru.logReq(req);
        var userid = req.body.userid;
        if (!userid) {
            resError(res, '参数错误')
            return;
        }
        userDao.queryUserInfo(userid, function(err, result) {
            if (err) {
                ru.resError(res, err);
            } else {
                logger.info('------用户信息------')
                var user = {};
                if (result.length > 0) {
                    user = result[0][0];
                    user.myfollow = result[1][0].count;
                    user.followme = result[2][0].count;
                }
                ru.resSuccess(res, user);
            }
        })
    } catch (err) {
        ru.resError(res, err.message);
    }

});
/**
 * 获取他人信息
 * */
router.post('/otherinfo', function(req, res, next) {
    try {
        ru.logReq(req);
        var userid = req.body.userid;
        var myid = req.body.myid;
        if (!userid) {
            ru.resError(res, '参数错误')
            return;
        }
        userDao.queryOtherInfo(myid, userid, function(err, result) {
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
/**
 * 关注
 * @param op 1 关注 0 取消关注
 */
router.post('/follow', function(req, res, next) {
    try {
        ru.logReq(req);
        var userid = req.body.userid;
        var fansid = req.body.fansid;
        var op = req.body.op;
        if (!userid || !fansid) {
            ru.resError(res, '参数错误');
        } else {
            userDao.upFollow(userid, fansid, op, function(err, result) {
                if (err) {
                    ru.resError(res, err);
                } else {
                    ru.resSuccess(res, result);
                    if (result.fstate == 1) {
                        userDao.queryUserFromId(userid, function(err, result) {
                            if (err) {

                            } else {
                                if (result && result.length > 0) {
                                    var user = result[0];
                                    var title = '有人关注了你';
                                    var content = user.nickname + '关注了你';
                                    var followExtend = new FollowExtend(user.userid, user.head, user.nickname);
                                    var message = new Message(MessageType.FOLLOW_MSG, fansid, title, content, followExtend);
                                    httputil.requstLocalPost('/message/actionmsg', message, function(err, result) {
                                        logger.debug(err);
                                        logger.debug(result);
                                    });
                                }
                            }
                        })

                    }
                }
            });
        }
    } catch (err) {
        ru.resError(res, err.message);
    }

});

router.post('/followinfo', function(req, res, next) {
    try {
        ru.logReq(req);
        var userid = req.body.userid;
        var fansid = req.body.fansid;
        if (!fansid) {
            ru.resError(res, '参数错误');
            return;
        }
        userDao.queryFollowUserV2(userid, fansid, function(err, result) {
            if (err) {
                ru.resError(res, err);
            } else {
                var follow = {
                    userid: userid,
                    fansid: fansid,
                    fstate: 0,
                    tstate: 0,
                };
                if (result[0].length > 0) {
                    follow.fstate = result[0][0].fstate;
                    follow.tstate = result[0][0].tstate;
                }
                if (result[1].length > 0) {
                    follow.head = result[1][0].head;
                    follow.nickname = result[1][0].nickname;
                }
                ru.resSuccess(res, follow);
            }
        });
        // if (!userid) {
        //     // ru.resError(res, '参数错误');
        //     var follow = {
        //         fstate: 0
        //     };
        //     ru.resSuccess(res, follow);
        // } else {
        //     userDao.queryFollowUser(userid, fansid, function(err, result) {
        //         if (err) {
        //             ru.resError(res, err);
        //         } else {
        //             var follow = {};
        //             if (result.length > 0) {
        //                 follow = result[0];
        //             }
        //             ru.resSuccess(res, follow);
        //         }
        //     });
        // }
    } catch (err) {
        ru.resError(res, err.message);
    }
});

// router.post('/getfollows',function(req,res,next){
//  logReq(req);
//  var userid = req.body.userid;
//  if(!userid){
//      resError(res,'参数错误');
//  }else{
//      userDao.queryFollow(userid,function(err,result){
//          if(err){
//              resError(res,err);
//          }else{
//              resSuccess(res,result);
//          }
//      });
//  }
// });
/**
 * 关注列表
 * @param  myid 我的id
 * @param  userid 用户的id
 * @param  0我的关注1关注我的
 */
router.post('/follows', function(req, res, next) {
    try {
        ru.logReq(req);
        var myid = req.body.myid;
        var userid = req.body.userid;
        var type = req.body.type;
        if (!userid) {
            ru.resError(res, '参数错误');
        } else {
            userDao.queryFollowType(myid, userid, type, function(err, result) {
                if (err) {
                    ru.resError(res, err);
                } else {
                    ru.resSuccess(res, result);
                }
            });
        }
    } catch (err) {
        ru.resError(res, err.message);
    }

});
/**
 * 查询
 */
router.post('/query', function(req, res, next) {
    try {
        ru.logReq(req);
        var op = req.body.op;
        if (!op) {
            resError(res, '参数错误');
        } else {
            if (op == 'userid') {
                var userid = req.body.userid;
                userDao.queryUserFromId(userid, function(err, result) {
                    if (err) {
                        ru.resError(res, err);
                    } else {
                        if (result.length > 0) {
                            var data = {
                                op: 'userid',
                                phone: result[0].phone,
                            }
                            ru.resSuccess(res, data);
                        } else {
                            ru.resError(res, '用户ID不存在');
                        }

                    }
                });
            } else if (op == 'phone') {
                var phone = req.body.phone;
                userDao.queryUser(phone, function(err, result) {
                    if (err) {
                        ru.resError(res, err);
                    } else {
                        if (result.length > 0) {
                            var data = {
                                op: 'phone',
                                userid: result[0].userid,
                            }
                            ru.resSuccess(res, data);
                        } else {
                            ru.resError(res, '手机号未组成');
                        }
                    }
                });
            } else {
                ru.resError(res, '操作类型错误');
            }
        }
    } catch (err) {
        ru.resError(res, err.message);
    }

});
/**
 *修改用户权限
 */
router.post('/permission', function(req, res, next) {
    try {
        ru.logReq(req);
        var userid = req.body.userid;
        var per = req.body.per;
        if (!userid || !per) {
            resError(res, '参数错误');
        } else {
            userDao.updatPermission(userid, per, function(err, result) {
                if (err) {
                    ru.resError(res, err);
                } else {
                    ru.resSuccess(res, { userid: userid, per: per });
                }
            });
        }
    } catch (err) {
        ru.resError(res, err.message);
    }

});

router.post('/privileges', function(req, res, next) {
    ru.logReq(req);
    try {
        var body = req.body;
        var userid = body.userid;
        if (!userid) {
            ru.resError(res, '参数错误!')
            return;
        }
        userDao.queryUserPer(userid, function(err, result) {
            if (err) {
                ru.resError(res, err);
                return;
            }
            var per = {};
            if (result.length > 0) {
                per = result[0];
            }
            ru.resSuccess(res, per);
        })
    } catch (err) {
        ru.resError(res, err.message);
    }
});
router.post('/setpri', function(req, res, next) {
    ru.logReq(req);
    try {
        var body = req.body;
        var userid = body.userid;
        var type = body.type;
        var b_value = body.b_value;
        if (!userid) {
            ru.resError(res, '参数错误!')
            return;
        }
        if (type != 'per_add') {
            ru.resError(res, '未知权限!')
            return;
        }
        userDao.upUserPerAdd(userid, b_value, function(err, result) {
            if (err) {
                ru.resError(res, err);
                return;
            }
            var per = {
                'per_add': b_value ? 1 : 0
            };
            ru.resSuccess(res, per);
        })
    } catch (err) {
        ru.resError(res, err.message);
    }
});

/**
 * 举报
 * type 2 用户 3 帖子
 */
router.post('/report', function(req, res, next) {
    try {
        ru.logReq(req);
        var userid = req.body.userid;
        report
        var type = req.body.type;
        var report = req.body.report;
        var custom = req.body.custom;
        var rid = req.body.rid;
        var ruserid = req.body.ruserid;
        if (!userid) {
            ru.resError(res, '请先登录');
        } else if (!type || (!report && !custom)) {
            ru.resError(res, '参数错误');
        } else {
            reportDao.addReport(userid, type, report, custom, rid, ruserid, function(err, result) {
                if (err) {
                    ru.resError(res, err);
                } else {
                    let tips = ''
                    if (type == 1) {
                        tips = '举报成功，客服将会在确认后对其进行处理';
                    } else if (type == 2) {
                        tips = '举报成功，客服将会在确认后对其进行处理'
                    } else if (type == 3) {
                        tips = '举报成功，客服将会在确认后对其进行处理'
                    }
                    ru.resSuccess(res, { tips: tips });
                }
            });
        }
    } catch (err) {
        ru.resError(res, err.message);
    }
});

//拉黑 
router.post('/pullblack', function(req, res, next) {
    try {
        ru.logReq(req);
        var body = req.body;
        var userid = body.userid;
        var buserid = body.buserid;
        if (!userid && !buserid) {
            ru.resError(res, '参数错误');
        } else {
            blacklistDao.queryBlack(userid, buserid, function(err, result) {
                if (err) {
                    ru.resError(res, err);
                } else {
                        console.log(result)
                    if (result.length > 0) {
                        ru.resError(res, '对方已在黑名单中！');
                    } else {
                        blacklistDao.addBlackList(userid, buserid, function(err, result) {
                            if (err) {
                                ru.resError(res, err);
                            } else {
                                var data = body;
                                data.id = result.insertId;
                                ru.resSuccess(res, data);
                            }
                        });
                    }
                }
            });
        }
    } catch (err) {
        ru.resError(res, err.message);
    }
});

router.post('/cancelblack', function(req, res, next) {
    try {
        ru.logReq(req);
        var body = req.body;
        var userid = body.userid;
        var buserid = body.buserid;
        if (!userid && !buserid) {
            ru.resError(res, '参数错误');
        } else {
            blacklistDao.deleteBlackList(userid, buserid, function(err, result) {
                if (err) {
                    ru.resError(res, err);
                } else {
                    var data = body;
                    // data.id = result.insertId;
                    ru.resSuccess(res, data);
                }
            });
        }
    } catch (err) {
        ru.resError(res, err.message);
    }
});

router.post('/blacklist', function(req, res, next) {
    try {
        ru.logReq(req);
        var userid = req.body.userid;
        if (!userid) {
            ru.resError(res, '参数错误');
        } else {
            blacklistDao.queryBlackList(userid, function(err, result) {
                if (err) {
                    ru.resError(res, err);
                } else {
                    ru.resSuccess(res, result);
                }
            });
        }
    } catch (err) {
        ru.resError(res, err.message);
    }
});


module.exports = router;