var _roomdir = "../";
var admin = require("firebase-admin");
var serviceAccount = require(_roomdir+"firebase_json/ps-book-firebase-adminsdk-awnbk-1909b9f7a2.json");
var logger = require(_roomdir+'utils/log4jsutil').logger(__dirname + '/push/fcm.js');
var { PushType } = require(_roomdir+'models/models');
var server = require(_roomdir+'conf/config').server;

var dbDaos = require(_roomdir+'daos/dbDaos');
var pushDao = dbDaos.pushDao;

var registrationToken = ''; //测试设备
// topic:os_android os_ios

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://ps-book.firebaseio.com"
});

module.exports = {
    sendAllPush: function(title, content, os, callback) {
        logger.info('---发送极光推送')
        logger.info('---server.push:' + server.push);
        if (!server.push) {
            callback(null, { sendno: 'sendno', msg_id: 'msg_id' });
            return
        }
        logger.info('---title:' + title)
        logger.info('---content:' + content)
        logger.info('---os:' + os)
        var extras = {
            type: PushType.NOTICE,
        }
        logger.info('-----extras');
        logger.info(extras);
        // logger.info('---notification:'+notification)
        //easy push
        var production = server.env === server.ali;
        logger.info('---production:' + production);
        if (production) {
            var topic = os == 'ios' ? 'os_ios' : 'os_android';
            var message = {
                notification: {
                    title: title,
                    body: content
                },
                data:extras,
                topic: topic
            };
            admin.messaging().send(message)
                .then((response) => {
                    // Response is a message ID string.
                    // console.log('Successfully sent message:', response);
                    logger.info(response)
                    callback(null, response);
                })
                .catch((error) => {
                    // console.log('Error sending message:', error);
                    logger.error(err);
                    callback(err, null);
                });
        } else {

            var message = {
                notification: {
                    title: title,
                    body: content
                },
                token: registrationToken
            };
            admin.messaging().send(message)
                .then((response) => {
                    // Response is a message ID string.
                    // console.log('Successfully sent message:', response);
                    logger.info(response)
                    callback(null, response);
                })
                .catch((error) => {
                    // console.log('Error sending message:', error);
                    logger.error(err);
                    callback(err, null);
                });
        }
    },
    /**
     * 发送单个推送
     */
    sendPush: function(userid, msgid, title, content, pushtype, callback) {
        logger.info('---发送极光推送');
        logger.info('---server.push:' + server.push);
        if (!server.push) {
            callback(null, { sendno: 'sendno', msg_id: 'msg_id' });
            return
        }
        pushDao.getPush(userid, function(err, result) {
            if (err) {
                logger.error(err)
                callback(err, null);
            } else {
                logger.info(result);
                if (result.length > 0) {
                    var push = result[0];
                    var pushid = push.pushid;
                    var os = push.os;
                    logger.info('---push obj:' + pushid);
                    if (pushid) {
                        logger.info('--- msgid:' + msgid + ' pushid:' + pushid + ' os:' + os);
                        logger.info('---title:' + title);
                        logger.info('---content:' + content);
                        logger.info('---pushtype:' + pushtype);
                        var extras = {
                            type: pushtype,
                        }
                        try {
                            logger.info('---extras:');
                            logger.info(extras);
                            var production = server.env === server.ali;
                            logger.info('---production:' + production);
                            var message = {
                                notification: {
                                    title: title,
                                    body: content
                                },
                                data:extras,
                                token: pushid
                            };
                            admin.messaging().send(message)
                                .then((response) => {
                                    // Response is a message ID string.
                                    // console.log('Successfully sent message:', response);
                                    logger.info(response)
                                    callback(null, response);
                                })
                                .catch((error) => {
                                    // console.log('Error sending message:', error);
                                    logger.error(err);
                                    callback(err, null);
                                });
                        } catch (err) {
                            logger.error(err);
                            callback(err, null);
                        }
                    } else {
                        callback('获取用户pushid失败', null);
                    }
                } else {
                    callback('获取用户pushid失败', null);
                }
            }
        });
    },
    sendPushs: function(userids, msgid, title, content, pushtype, callback) {
        logger.info('---发送极光推送');
        logger.info('---server.push:' + server.push);
        logger.info(userids);
        if (!server.push) {
            callback(null, { sendno: 'sendno', msg_id: 'msg_id' });
            return
        }
        pushDao.getPushs(userids, function(err, result) {
            if (err) {
                logger.error(err)
                callback(err, null);
            } else {
                logger.info(result);
                if (result.length > 0) {
                    var pushids = [];
                    for (var i = 0; i < result.length; i++) {
                        pushids.push(result[i].pushid);
                    }
                    logger.info('---pushids obj:' + pushids);
                    if (pushids.length > 0) {
                        logger.info('--- msgid:' + msgid + ' pushids:' + pushids);
                        logger.info('---title:' + title);
                        logger.info('---content:' + content);
                        logger.info('---pushtype:' + pushtype);
                        var extras = {
                            type: pushtype,
                        }
                        try {
                            logger.info('---extras:');
                            logger.info(extras);
                            var production = server.env === server.ali; //区分生产，开发环境
                            logger.info('---production:' + production);
                            if (production) {
                                var message = {
                                    notification: {
                                        title: title,
                                        body: content
                                    },
                                    tokens: pushids
                                };
                                admin.messaging().sendMulticast(message)
                                    .then((response) => {
                                        // Response is a message ID string.
                                        // console.log('Successfully sent message:', response);
                                        logger.info(response)
                                        callback(null, response);
                                    })
                                    .catch((error) => {
                                        // console.log('Error sending message:', error);
                                        logger.error(err);
                                        callback(err, null);
                                    });
                            } else {

                                var message = {
                                    notification: {
                                        title: title,
                                        body: content
                                    },
                                    token: registrationToken
                                };
                                admin.messaging().send(message)
                                    .then((response) => {
                                        // Response is a message ID string.
                                        // console.log('Successfully sent message:', response);
                                        logger.info(response)
                                        callback(null, response);
                                    })
                                    .catch((error) => {
                                        // console.log('Error sending message:', error);
                                        logger.error(err);
                                        callback(err, null);
                                    });
                            }
                        } catch (err) {
                            logger.error(err);
                            callback(err, null);
                        }
                    } else {
                        callback('获取用户pushid失败', null);
                    }
                } else {
                    callback('获取用户pushid失败', null);
                }
            }
        });
    },
    sendSysPush: function(title, content, push_extras, callback) {
        logger.info('---发送极光推送')
        logger.info('---server.push:' + server.push);
        if (!server.push) {
            callback(null, { sendno: 'sendno', msg_id: 'msg_id' });
            return
        }
        var os = 'all';
        logger.info('---title:' + title)
        logger.info('---content:' + content)
        logger.info('---os:' + os)
        var basr_extras = {
            type: PushType.NOTICE,
        }
        var extras = Object.assign(basr_extras, push_extras)
        logger.info('-----extras');
        logger.info(extras);
        // logger.info('---notification:'+notification)
        //easy push
        var production = server.env === server.ali;
        logger.info('---production:' + production);
        if (production) {
            var topic = os == 'ios' ? 'os_ios' : 'os_android';
            var message = {
                notification: {
                    title: title,
                    body: content
                },
                data:extras,
            };
            admin.messaging().sendAll(message)
                .then((response) => {
                    // Response is a message ID string.
                    // console.log('Successfully sent message:', response);
                    logger.info(response)
                    callback(null, response);
                })
                .catch((error) => {
                    // console.log('Error sending message:', error);
                    logger.error(err);
                    callback(err, null);
                });
        } else {

            var message = {
                notification: {
                    title: title,
                    body: content
                },
                data:extras,
                token: registrationToken
            };
            console.log('------message')
            console.log(message)
            admin.messaging().send(message)
                .then((response) => {
                    // Response is a message ID string.
                    // console.log('Successfully sent message:', response);
                    logger.info(response)
                    callback(null, response);
                })
                .catch((error) => {
                    // console.log('Error sending message:', error);
                    logger.error(err);
                    callback(err, null);
                });
        }
    },
}