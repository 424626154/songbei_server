var _roomdir = "../";
var logger = require(_roomdir + 'utils/log4jsutil').logger(__dirname + '/loveDao.js');
var pool = require('./dao');
var utils = require(_roomdir + 'utils/utils');
var dbTables = require('./dbTables');

const DISCUSS_TABLE = dbTables.DISCUSS_TABLE;
const COMMENT_TABLE = dbTables.COMMENT_TABLE;
const LOVECOMMENT_TABLE = dbTables.LOVECOMMENT_TABLE;
const LOVE_TABLE = dbTables.LOVE_TABLE;
const USER_TABLE = dbTables.USER_TABLE;
const LIMIT_NUM = '100';

module.exports = {
    /*------------点赞------------*/
    /**
     * 查询评论对象是否存在
     * 
     */
    queryCount(id, type, callback) {
        var sql = 'SELECT Count(*) FROM ' + DISCUSS_TABLE + ' WHERE id = ? AND del = 0 LIMIT 1';
        pool.getConnection(function(err, connection) {
            connection.query(sql, [id, type], function(err, result) {
                if (err) {
                    callback(err, result)
                    connection.release();
                } else {
                    var count = 0;
                    if (result.length > 0) {
                        count = result[0]['Count(*)'];
                    }
                    callback(err, count)
                    connection.release();

                }
            });
        });
    },
    /**
     * 点赞
     */
    upLove(iid, type, userid, love, callback) {
        var time = utils.getDateTime();
        var sql = 'SELECT * FROM ' + LOVE_TABLE + ' WHERE iid = ? AND userid = ? AND type = ?';
        pool.getConnection(function(err, connection) {
            connection.query(sql, [iid, userid, type], function(err, result) {
                if (err) {
                    callback(err, result)
                    connection.release();
                } else {
                    // console.log(result)
                    var sql0 = 'INSERT INTO ' + LOVE_TABLE + ' (iid,type,userid,love,create_time,update_time) VALUES (' + iid + ',' + type + ',"' + userid + '",' + love + ',\"' + time + '\",\"' + time + '\")';
                    if (result.length > 0) {
                        sql0 = 'UPDATE ' + LOVE_TABLE + ' SET love = ' + love + ' , update_time = \"' + time + '\" WHERE iid = ' + iid + ' AND type = ' + type;
                    }
                    console.log(sql0)
                    var sql1 = 'SELECT COUNT(*) FROM ' + LOVE_TABLE + ' WHERE iid = ' + iid + ' AND type = ' + type + ' AND love = 1';
                    var sql2 = 'UPDATE ' + DISCUSS_TABLE + ' SET lovenum = (' + sql1 + ') WHERE id = ' + iid;
                    var sql3 = 'SELECT * FROM ' + LOVE_TABLE + ' WHERE iid = ' + iid + ' AND userid = "' + userid + '" AND type = ' + type;
                    var sql4 = 'SELECT love.*,user.head,user.nickname FROM (' + sql3 + ') AS love LEFT JOIN ' + USER_TABLE + ' AS user ON love.userid = user.userid';
                    var sql = sql0 + ';' + sql2 + ';' + sql4;
                    connection.query(sql, function(err, result) {
                        if (err) {
                            callback(err, result)
                        } else {
                            callback(err, result[2][0])
                        }
                        connection.release();
                    });
                }
            });
        });
    },
    // 点赞评论
    loveComment(iid, icid, userid, love, type, callback) {
        var inf_sql = 'SELECT COUNT(*) FROM ' + DISCUSS_TABLE + ' WHERE id = ' + iid;
        var inf_com_sql = 'SELECT COUNT(*) FROM ' + COMMENT_TABLE + ' WHERE id = ' + icid + ' AND type = ' + type;
        var inf_com_love_sql = 'SELECT COUNT(*) FROM ' + LOVECOMMENT_TABLE + ' WHERE iid = ' + iid + ' AND icid = ' + icid + ' AND type = ' + type;
        var sql = inf_sql + ';' + inf_com_sql + ';' + inf_com_love_sql;
        console.log(sql)
        pool.getConnection(function(err, connection) {
            connection.query(sql, function(err, result) {
                var inf_count = 0;
                if (result[0].length > 0) {
                    inf_count = result[0][0]['COUNT(*)']
                }
                var inf_com_count = 0;
                if (result[1].length > 0) {
                    inf_com_count = result[1][0]['COUNT(*)']
                }
                if (inf_count == 0) {
                    err = 'ID不存在'
                    callback(err, result)
                    connection.release();
                } else if (inf_com_count = 0) {
                    err = '评论不存在'
                    callback(err, result)
                    connection.release();
                } else {
                    var inf_com_love_count = 0;
                    if (result[2].length > 0) {
                        inf_com_love_count = result[2][0]['COUNT(*)']
                    }
                    var time = utils.getDateTime();
                    var sql1 = 'INSERT INTO ' + LOVECOMMENT_TABLE + ' (iid,icid,userid,love,type,create_time,update_time) VALUES (' + iid + ',' + icid + ',"' + userid + '",' + love + ',' + type + ',\"' + time + '\",\"' + time + '\")';
                    if (inf_com_love_count > 0) {
                        sql1 = 'UPDATE ' + LOVECOMMENT_TABLE + ' SET love = ' + love + ' , update_time = \"' + time + '\" WHERE iid = ' + iid + ' AND icid = ' + icid + ' AND type = ' + type;
                    }
                    console.log(sql1)
                    connection.query(sql1, function(err, result) {
                        callback(err, result)
                        connection.release();
                    });
                }
            });
        });
    },
    /**
     * 添加评论点赞数量
     */
    addCommentLoveNum(icid, type, callback) {
        var sql = 'SELECT * FROM ' + COMMENT_TABLE + ' WHERE id = ? AND del = 0'
        pool.getConnection(function(err, connection) {
            connection.query(sql, [icid, type], function(err, result) {
                if (err) {
                    callback(err, result)
                    connection.release();
                } else {
                    if (result.length > 0) {
                        var id = result[0].id;
                        var lovenum = result[0].lovenum + 1;
                        var sql1 = 'UPDATE ' + COMMENT_TABLE + ' SET lovenum = ? WHERE id = ? AND type = ?'
                        console.log(sql1)
                        connection.query(sql1, [lovenum, id, type], function(err, result) {
                            callback(err, result)
                            connection.release();
                        })
                    }
                }
            });
        });
    },
    /**
     * 减少评论点赞数量
     */
    reduceCommentLoveNum(icid, type, callback) {
        console.log('------reduceCommentLoveNum')
        var sql = 'SELECT * FROM ' + COMMENT_TABLE + ' WHERE id = ? AND type = ? AND del = 0'
        pool.getConnection(function(err, connection) {
            connection.query(sql, [icid, type], function(err, result) {
                if (err) {
                    callback(err, result)
                    connection.release();
                } else {
                    if (result.length > 0) {
                        var id = result[0].id;
                        if (result[0].lovenum > 0) {
                            var lovenum = result[0].lovenum - 1;
                            var sql1 = 'UPDATE ' + COMMENT_TABLE + ' SET lovenum = ? WHERE id = ? AND type = ?'
                            console.log(sql1)
                            connection.query(sql1, [lovenum, id, type], function(err, result) {
                                callback(err, result)
                                connection.release();
                            })
                        } else {
                            callback(err, result)
                            connection.release();
                        }
                    } else {
                        callback(err, result)
                        connection.release();
                    }
                }
            });
        });
    },
    /**
     * 获取点赞列表
     */
    queryLoves(iid, type, callback) {
        var sql = 'SELECT * FROM ' + LOVE_TABLE + ' WHERE iid = ? AND type = ? AND love = 1';
        sql = 'SELECT love.*,user.head,user.nickname,user.profile FROM (' + sql + ') AS love LEFT JOIN ' + USER_TABLE + ' AS user ON love.userid = user.userid';
        pool.getConnection(function(err, connection) {
            connection.query(sql, [iid, type], function(err, result) {
                callback(err, result)
                connection.release();
            });
        });
    },
    /**
     * 查询讨论点赞数和评论数
     */
    queryLCNum(id, type, callback) {
        var sql = 'SELECT id,lovenum,commentnum FROM ' + DISCUSS_TABLE + ' WHERE id = ? AND del = 0';
        console.log(sql)
        pool.getConnection(function(err, connection) {
            connection.query(sql, [id], function(err, result) {
                callback(err, result)
                connection.release();
            });
        });
    },
}