var _roomdir = "../";
var logger = require(_roomdir + 'utils/log4jsutil').logger(__dirname + '/userDao.js');
var pool = require('./dao');
var utils = require(_roomdir + 'utils/utils');

var tables = require('./dbTables');
var USER_TABLE = tables.USER_TABLE;
var VERIFYCODE_TABLE = tables.VERIFYCODE; //验证码
var FOLLOW_TABLE = tables.FOLLOW_TABLE;

module.exports = {
    addUser: function(userid, country_code,phone, password,os, callback) {
        var sql = 'INSERT INTO ' + USER_TABLE + '(userid,country_code,phone,password,os) VALUES(?,?,?,?,?)';
        pool.getConnection(function(err, connection) {
            connection.query(sql, [userid,country_code,phone, password,os], function(err, result) {
                if (err) {
                    callback(err, result)
                    connection.release();
                } else {
                    var id = result.insertId;
                    sql = 'SELECT * FROM ' + USER_TABLE + ' WHERE id = ?';
                    connection.query(sql, [id], function(err, result) {
                        callback(err, result)
                        connection.release();
                    })
                }

            });
        });
    },
    /**
     * 添加用户 密码
     * @param {[type]}   userid   [description]
     * @param {[type]}   phone    [description]
     * @param {[type]}   os       [description]
     * @param {Function} callback [description]
     */
    addUserPwd: function(userid, phone, password, os, callback) {
        var sql = 'INSERT INTO ' + USER_TABLE + '(userid,phone,password,os) VALUES(?,?,?,?)';
        pool.getConnection(function(err, connection) {
            connection.query(sql, [userid, phone, password, os], function(err, result) {
                if (err) {
                    callback(err, result)
                    connection.release();
                } else {
                    var id = result.insertId;
                    sql = 'SELECT * FROM ' + USER_TABLE + ' WHERE id = ?';
                    connection.query(sql, [id], function(err, result) {
                        callback(err, result)
                        connection.release();
                    })
                }

            });
        });
    },
    upUser: function(userid, nickname, head, gender, birth_date, profile, callback) {
        var sql = 'UPDATE ' + USER_TABLE + ' SET nickname = ? , head = ? , gender = ? , birth_date = ? , profile = ?  , perfect = ?  WHERE userid = ? ';
        pool.getConnection(function(err, connection) {
            connection.query(sql, [nickname, head, gender, birth_date, profile, 1, userid], function(err, result) {
                callback(err, result)
                connection.release();
            });
        });
    },
    updateAliSms: function(phone, type, RequestId, BizId, callback) {
        var sql = 'UPDATE ' + VERIFYCODE_TABLE + ' SET RequestId = ? , BizId = ? WHERE phone = ? AND type = ?';
        pool.getConnection(function(err, connection) {
            connection.query(sql, [RequestId, BizId, phone, type], function(err, result) {
                callback(err, result)
                connection.release();
            });
        });
    },
    updateJPushSms: function(phone, type, msg_id, callback) {
        var sql = 'UPDATE ' + VERIFYCODE_TABLE + ' SET msg_id = ? WHERE phone = ? AND type = ?';
        pool.getConnection(function(err, connection) {
            connection.query(sql, [msg_id, phone, type], function(err, result) {
                callback(err, result)
                connection.release();
            });
        });
    },
    updateUserOs:function(userid,os,callback){
        var sql = 'UPDATE user SET os = ?  WHERE userid = ? ';
        pool.getConnection(function(err, connection) {
            connection.query(sql, [os,userid], function(err, result) {
                callback(err, result)
                connection.release();
            });
        });
    },
    upPassword: function(phone, password, callback) {
        var sql = 'UPDATE ' + USER_TABLE + ' SET password = ? WHERE phone = ? ';
        pool.getConnection(function(err, connection) {
            connection.query(sql, [password, phone], function(err, result) {
                callback(err, result)
                connection.release();
            });
        });
    },
    upOpenid: function(openid, phone, callback) {
        var sql = 'UPDATE ' + USER_TABLE + ' SET openid = ? WHERE phone = ? ';
        pool.getConnection(function(err, connection) {
            connection.query(sql, [openid, phone], function(err, result) {
                callback(err, result)
                connection.release();
            });
        });
    },
    upInviteCode: function(userid, code, callback) {
        var sql = 'UPDATE ' + USER_TABLE + ' SET code = ? WHERE userid = ? ';
        pool.getConnection(function(err, connection) {
            connection.query(sql, [code, userid], function(err, result) {
                callback(err, result)
                connection.release();
            });
        });
    },
    upUserPerAdd: function(userid, per_add, callback) {
        var sql = 'UPDATE ' + USER_TABLE + ' SET per_add = ? WHERE userid = ? ';
        pool.getConnection(function(err, connection) {
            connection.query(sql, [per_add, userid], function(err, result) {
                callback(err, result)
                connection.release();
            });
        });
    },
    updateVipTime:function(userid, vip_time, callback) {
        var sql = 'UPDATE ' + USER_TABLE + ' SET vip_time = ? WHERE userid = ? ';
        pool.getConnection(function(err, connection) {
            connection.query(sql, [vip_time, userid], function(err, result) {
                callback(err, result)
                connection.release();
            });
        });
    },
    queryAllUserIdFromOs(os, callback) {
        var sql = '';
        if (os == 'all') {
            sql = 'SELECT ' + USER_TABLE + '.userid FROM ' + USER_TABLE;
        } else if (os == 'android' || os == 'ios') {
            sql = 'SELECT ' + USER_TABLE + '.userid FROM ' + USER_TABLE + ' WHERE os = "' + os + '"';
        } else {
            callback(new Error('os 参数错误'), null);
            return;
        }
        console.log(sql);
        pool.getConnection(function(err, connection) {
            connection.query(sql, function(err, result) {
                callback(err, result)
                connection.release();
            });
        });
    },
    queryUser: function(phone, callback) {
        var sql = 'SELECT * ,UNIX_TIMESTAMP(vip_time) AS vip_time FROM ' + USER_TABLE + ' WHERE phone = ? LIMIT 1';
        pool.getConnection(function(err, connection) {
            try {
                connection.query(sql, phone, function(err, result) {
                    callback(err, result)
                    connection.release();
                });
            } catch (err) {
                logger.error(err);
                callback(err, null);
            }
        });
    },
    queryUserInfo: function(userid, callback) {
        var userinfo = 'SELECT * ,UNIX_TIMESTAMP(vip_time) AS vip_time FROM  ' + USER_TABLE + ' WHERE userid = ? LIMIT 1';
        var myfollow = ' SELECT COUNT(*) AS count FROM ' + FOLLOW_TABLE + ' WHERE userid = ? AND fstate = 1';
        var followme = ' SELECT COUNT(*) AS count FROM ' + FOLLOW_TABLE + ' WHERE userid = ? AND tstate = 1';
        var sql = userinfo + ';' + myfollow + ';' + followme;
        pool.getConnection(function(err, connection) {
            try {
                connection.query(sql, [userid, userid, userid], function(err, result) {
                    callback(err, result)
                    connection.release();
                });
            } catch (err) {
                logger.error(err);
                callback(err, null);
            }
        });
    },
    queryUserFromId: function(userid, callback) {
        var sql = 'SELECT * ,UNIX_TIMESTAMP(vip_time) AS vip_time FROM ' + USER_TABLE + ' WHERE userid = ? LIMIT 1';
        pool.getConnection(function(err, connection) {
            connection.query(sql, userid, function(err, result) {
                callback(err, result)
                connection.release();
            });
        });
    },
    /**
     * 查询用户邀请码
     * @param  {[type]}   userid   [description]
     * @param  {Function} callback [description]
     * @return {[type]}            [description]
     */
    queryUserIdCode: function(userid, callback) {
        var sql = 'SELECT id,code FROM ' + USER_TABLE + ' WHERE userid = ? LIMIT 1';
        pool.getConnection(function(err, connection) {
            connection.query(sql, userid, function(err, result) {
                callback(err, result)
                connection.release();
            });
        });
    },
    queryFollowMe: function(userid, callback) {
        var sql = 'SELECT * FROM ' + FOLLOW_TABLE + ' WHERE userid = "' + userid + '" AND tstate = 1';
        pool.getConnection(function(err, connection) {
            connection.query(sql, function(err, result) {
                callback(err, result)
                connection.release();
            });
        });
    },
    queryUserPer: function(userid, callback) {
        var sql = 'SELECT per_add FROM ' + USER_TABLE + ' WHERE userid = ? LIMIT 1';
        pool.getConnection(function(err, connection) {
            connection.query(sql, userid, function(err, result) {
                callback(err, result)
                connection.release();
            });
        });
    },
    /**
     * 关注列表
     */
    queryFollowType: function(myid, userid, type, callback) {
        pool.getConnection(function(err, connection) {
            var left_user = 'LEFT JOIN ' + USER_TABLE + ' ON follow.fansid = ' + USER_TABLE + '.userid';
            var left_follow = 'LEFT JOIN ' + FOLLOW_TABLE + ' AS myfollow ON follows.fansid = myfollow.fansid AND myfollow.userid = "' + myid + '"';
            var sql0 = 'SELECT * FROM ' + FOLLOW_TABLE + ' WHERE userid = "' + userid + '" AND fstate = 1';
            sql0 = 'SELECT follow.*,' + USER_TABLE + '.head,' + USER_TABLE + '.nickname,' + USER_TABLE + '.profile FROM (' + sql0 + ') AS follow ' + left_user;
            if (myid != userid) {
                sql0 = 'SELECT follows.*,myfollow.fstate,myfollow.tstate FROM (' + sql0 + ') AS follows ' + left_follow;
            }
            var sql1 = 'SELECT * FROM ' + FOLLOW_TABLE + ' WHERE userid = "' + userid + '" AND tstate = 1';
            sql1 = 'SELECT follow.*,' + USER_TABLE + '.head,' + USER_TABLE + '.nickname,' + USER_TABLE + '.profile FROM (' + sql1 + ') AS follow ' + left_user;
            if (myid != userid) {
                sql1 = 'SELECT follows.id,follows.userid,follows.fansid,follows.head,follows.nickname,IFNULL(myfollow.fstate,0) AS fstate,IFNULL(myfollow.tstate,0) AS tstate FROM (' + sql1 + ') AS follows ' + left_follow;
            }
            var sql = sql0;
            if (type == 1) {
                sql = sql1;
            }
            connection.query(sql, function(err, result) {
                callback(err, result)
                connection.release();
            });
        });
    },
    queryFollowUser: function(userid, fansid, callback) {
        pool.getConnection(function(err, connection) {
            var left_user = 'LEFT JOIN ' + USER_TABLE + ' ON follow.fansid = ' + USER_TABLE + '.userid';
            var sql0 = 'SELECT * FROM ' + FOLLOW_TABLE + ' WHERE userid = ? AND fansid = ? LIMIT 1';
            var sql = 'SELECT follow.*,' + USER_TABLE + '.head,' + USER_TABLE + '.nickname,' + USER_TABLE + '.profile FROM (' + sql0 + ') AS follow ' + left_user;
            connection.query(sql, [userid, fansid], function(err, result) {
                callback(err, result)
                connection.release();
            });
        });
    },
    queryFollowUserV2: function(userid, fansid, callback) {
        pool.getConnection(function(err, connection) {
            // var left_user = 'LEFT JOIN '+USER_TABLE+' ON follow.fansid = '+USER_TABLE+'.userid';
            // var sql0 = 'SELECT * FROM '+FOLLOW_TABLE+' WHERE userid = ? AND fansid = ? LIMIT 1';
            // var sql = 'SELECT follow.*,'+USER_TABLE+'.head,'+USER_TABLE+'.nickname,'+USER_TABLE+'.profile FROM ('+sql0+') AS follow '+left_user;
            var follow_sql = 'SELECT * FROM ' + FOLLOW_TABLE + ' WHERE userid = ? AND fansid = ? LIMIT 1';
            var user_sql = 'SELECT userid,head,nickname,profile FROM ' + USER_TABLE + ' WHERE userid = ?';
            var sql = follow_sql + ';' + user_sql;
            connection.query(sql, [userid, fansid, fansid], function(err, result) {
                callback(err, result)
                connection.release();
            });
        });
    },
    /**
     * 关注取关操作
     * return        {
              id: 50,
              userid: 'userid_13212345676',
              fansid: 'userid_13671172337',
              fstate: 1,
            }
     */
    upFollow: function(userid, fansid, op, callback) {
        pool.getConnection(function(err, connection) {
            var sql0 = 'INSERT INTO ' + FOLLOW_TABLE + ' (userid,fansid,fstate) VALUES ("' + userid + '","' + fansid + '",' + op + ') ON DUPLICATE KEY UPDATE fstate=' + op;
            var sql1 = 'INSERT INTO ' + FOLLOW_TABLE + ' (userid,fansid,tstate) VALUES ("' + fansid + '","' + userid + '",' + op + ') ON DUPLICATE KEY UPDATE tstate=' + op;
            var sql = sql0 + ';' + sql1;
            console.log(sql);
            connection.query(sql, function(err, result) {
                if (err) {
                    callback(err, result)
                    connection.release();
                } else {
                    sql = 'SELECT * FROM ' + FOLLOW_TABLE + ' WHERE userid = ? AND fansid = ?';
                    connection.query(sql, [userid, fansid], function(err, result) {
                        var follow = {};
                        if (result.length > 0) {
                            follow = result[0];
                        }
                        callback(err, follow);
                        connection.release();
                    });
                }

            });
        });
    },
    queryOtherInfo: function(myid, userid, callback) {
        var userinfo = 'SELECT user.userid,user.head,user.nickname,user.profile,user.gender,user.birth_date FROM ' + USER_TABLE + ' AS user WHERE userid = "' + userid + '"';
        var myfollow = ' SELECT COUNT(*) AS count FROM ' + FOLLOW_TABLE + ' WHERE userid = "' + userid + '" AND fstate = 1';
        var followme = ' SELECT COUNT(*) AS count FROM ' + FOLLOW_TABLE + ' WHERE userid = "' + userid + '" AND tstate = 1';
        var follow = 'SELECT follow.fstate,follow.tstate FROM ' + FOLLOW_TABLE + ' AS follow WHERE userid = "' + myid + '" AND fansid = "' + userid + '"';
        // var star = ' SELECT COUNT(*) AS count FROM ' + STAR_TABLE + ' WHERE userid = "' + userid + '" AND star = 1';
        // var discuss_sql = ' SELECT COUNT(*) AS count FROM ' + DISCUSS_TABLE + ' WHERE userid = "' + userid + '" AND del = 0 ';
        var sql = userinfo + ';' + myfollow + ';' + followme + ';' + follow; //+ ';' + star + ';' + discuss_sql;
        // console.log(sql);
        pool.getConnection(function(err, connection) {
            connection.query(sql, function(err, result) {
                if (err) {
                    callback(err, result)
                    connection.release();
                } else {
                    var user = {};
                    if (result[0].length > 0) {
                        user = result[0][0];
                        user.myfollow = result[1][0].count;
                        user.followme = result[2][0].count;
                        user.fstate = 0;
                        user.tstate = 0;
                        if (result[3].length > 0) {
                            user.fstate = result[3][0].fstate;
                            user.tstate = result[3][0].tstate;
                        }
                        // user.starnum = result[4][0].count;
                        // user.discussnum = result[5][0].count;
                    }
                    callback(err, user)
                    connection.release();
                }

            });
        });
    },
}