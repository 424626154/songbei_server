var _roomdir = "../";
var logger = require(_roomdir + 'utils/log4jsutil').logger(__dirname + '/commentDao.js');
var pool = require('./dao');
var utils = require(_roomdir + 'utils/utils');
var dbTables = require('./dbTables');

const DISCUSS_TABLE = dbTables.DISCUSS_TABLE;
const COMMENT_TABLE = dbTables.COMMENT_TABLE;
const USER_TABLE = dbTables.USER_TABLE;
const LOVECOMMENT_TABLE = dbTables.LOVECOMMENT_TABLE;
const LIMIT_NUM = '100';

module.exports = {
    /*------------评论------------*/
    /**
     * 查询评论对象是否存在
     */
    queryCount(id, type, callback) {
        var sql = 'SELECT Count(*) FROM ' + DISCUSS_TABLE + ' WHERE id = ? AND del = 0 LIMIT 1';
        pool.getConnection(function(err, connection) {
            connection.query(sql, id, function(err, result) {
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
     * 添加作品评论
     */
    addComment(id, type, userid, cid, comment, callback) {
        var time = utils.getDateTime();
        pool.getConnection(function(err, connection) {
            var comment_data = {
                iid: id,
                userid: userid,
                cid: 0,
                cuserid: '',
                comment: comment,
                time: time,
            }
            if (cid > 0) { //回复评论的评论
                var sql = 'SELECT * FROM ' + COMMENT_TABLE + ' WHERE id = ? AND type = ?';
                connection.query(sql, [cid, type], function(err, result) {
                    if (err) {
                        callback(err, result)
                        connection.release();
                    } else {
                        if (result.length > 0) {
                            var cuserid = result[0].userid;
                            var sql1 = 'INSERT INTO ' + COMMENT_TABLE + '(iid,type,userid,cid,cuserid,comment,create_time,update_time) VALUES(?,?,?,?,?,?,?,?)'
                            connection.query(sql1, [id, type, userid, cid, cuserid, comment, time, time], function(err, result) {
                                if (err) {
                                    callback(err, result);
                                    connection.release();
                                } else {
                                    comment_data.id = result.insertId;
                                    comment_data.cid = cid;
                                    comment_data.cuserid = cuserid;
                                    sql1 = 'SELECT *,  UNIX_TIMESTAMP(update_time) AS time  FROM ' + COMMENT_TABLE + ' WHERE id = ? AND type = ?';
                                    sql1 = 'SELECT comment.*,user.head,user.nickname FROM (' + sql1 + ') AS comment LEFT JOIN ' + USER_TABLE + ' AS user ON comment.userid = user.userid';
                                    sql1 = 'SELECT comment.*,user.head AS chead ,user.nickname AS cnickname FROM (' + sql1 + ') AS comment LEFT JOIN ' + USER_TABLE + ' AS user ON comment.cuserid = user.userid';
                                    connection.query(sql1, [comment_data.id, type], function(err, result) {
                                        if (!err && result.length > 0) {
                                            comment_data = result[0];
                                        }
                                        comment_data.love = 0;
                                        callback(err, comment_data);
                                        connection.release();
                                    })
                                }
                            });
                        } else {
                            callback(err, result)
                            connection.release();
                        }
                    }
                });
            } else {
                var sql1 = 'INSERT INTO ' + COMMENT_TABLE + ' (iid,type,userid,cid,cuserid,comment,create_time,update_time) VALUES(?,?,?,?,?,?,?,?)'
                connection.query(sql1, [id, type, userid, 0, '', comment, time, time], function(err, result) {
                    if (err) {
                        callback(err, result);
                        connection.release();
                    } else {
                        comment_data.id = result.insertId;
                        sql1 = 'SELECT *,  UNIX_TIMESTAMP(update_time) AS time FROM ' + COMMENT_TABLE + ' WHERE id = ? AND type = ? ';
                        sql1 = 'SELECT comment.*,user.head,user.nickname FROM (' + sql1 + ') AS comment LEFT JOIN ' + USER_TABLE + ' AS user ON comment.userid = user.userid';
                        connection.query(sql1, [comment_data.id, type], function(err, result) {
                            if (!err && result.length > 0) {
                                comment_data = result[0];
                            }
                            comment_data.chead = '';
                            comment_data.cnickname = '';
                            callback(err, comment_data);
                            connection.release();
                        })
                    }
                });
            }
        });
    },
    addCommentV2(id, type, userid, cid, cuserid,comment, callback) {
        var time = utils.getDateTime();
        var sql = 'INSERT INTO ' + COMMENT_TABLE + ' (iid,type,userid,cid,cuserid,comment,create_time,update_time) VALUES(?,?,?,?,?,?,?,?)'
        pool.getConnection(function(err, connection) {
            connection.query(sql, [id, type, userid, cid, cuserid, comment, time, time], function(err, result) {
                callback(err, result)
                connection.release();
            });
        });
    },

    /**
     * 删除评论
     */
    delComment: function(id, type, userid, callback) {
        var sql = 'UPDATE ' + COMMENT_TABLE + ' SET del = 1 WHERE id = ? AND type = ? AND userid = ?';
        pool.getConnection(function(err, connection) {
            connection.query(sql, [id, type, userid], function(err, result) {
                callback(err, result)
                connection.release();
            });
        });
    },
    /**
     * 添加评论数量
     */
    addCommentNum(iid, type, callback) {
        var sql = 'SELECT * FROM ' + DISCUSS_TABLE + ' WHERE id = ? AND del = 0'
        pool.getConnection(function(err, connection) {
            connection.query(sql, [iid], function(err, result) {
                if (err) {
                    callback(err, result)
                    connection.release();
                } else {
                    if (result.length > 0) {
                        var id = result[0].id;
                        var commentnum = result[0].commentnum + 1;
                        var sql1 = 'UPDATE ' + DISCUSS_TABLE + ' SET commentnum = ? WHERE id = ?'
                        connection.query(sql1, [commentnum, id], function(err, result) {
                            callback(err, result)
                            connection.release();
                        })
                    }
                }
            });
        });
    },
    /**
     * 减少评论数量
     */
    reduceCommentNum(iid, type, callback) {
        pool.getConnection(function(err, connection) {
            var sql = 'SELECT * FROM ' + DISCUSS_TABLE + ' WHERE id = ? AND del = 0'
            connection.query(sql, [iid], function(err, result) {
                if (err) {
                    callback(err, result)
                    connection.release();
                } else {
                    if (result.length > 0) {
                        var id = result[0].id;
                        if (result[0].commentnum > 0) {
                            var commentnum = result[0].commentnum - 1;
                            var sql1 = 'UPDATE ' + DISCUSS_TABLE + ' SET commentnum = ? WHERE id = ?'
                            connection.query(sql1, [commentnum, id], function(err, result) {
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
     * 
     * 查询最新评论
     */
    queryLatest(fromid, iid, type, callback) {
        var sql = 'SELECT *,  UNIX_TIMESTAMP(update_time) AS time  FROM ' + COMMENT_TABLE + ' WHERE id>?  AND iid = ? AND type = ? AND del = 0  ORDER BY id DESC LIMIT ' + LIMIT_NUM;
        var sql = 'SELECT comment.*,user.head,user.nickname FROM (' + sql + ') AS comment LEFT JOIN ' + USER_TABLE + ' AS user ON comment.userid = user.userid';
        var sql = 'SELECT comment.*,user.head AS chead ,user.nickname AS cnickname FROM (' + sql + ') AS comment LEFT JOIN ' + USER_TABLE + ' AS user ON comment.cuserid = user.userid ';
        var sql = 'SELECT comment.*,IFNULL(lovecomment.love ,0) AS love FROM (' + sql + ') AS comment LEFT JOIN ' + LOVECOMMENT_TABLE + ' AS lovecomment ON comment.id = lovecomment.icid ORDER BY id DESC ';
        pool.getConnection(function(err, connection) {
            connection.query(sql, [fromid, iid, type], function(err, result) {
                console.log(result)
                callback(err, result)
                connection.release();
            });
        });
    },

    /**
     * 查询历史评论
     */
    queryHistory(fromid, iid, type, callback) {
        var sql = 'SELECT *,  UNIX_TIMESTAMP(update_time) AS time  FROM ' + COMMENT_TABLE + ' WHERE id<?  AND iid = ? AND type = ? AND del = 0 ORDER BY id DESC LIMIT ' + LIMIT_NUM;
        var sql = 'SELECT comment.*,user.head,user.nickname FROM (' + sql + ') AS comment LEFT JOIN ' + USER_TABLE + ' AS user ON comment.userid = user.userid ';
        var sql = 'SELECT comment.*,user.head AS chead ,user.nickname AS cnickname FROM (' + sql + ') AS comment LEFT JOIN ' + USER_TABLE + ' AS user ON comment.cuserid = user.userid ';
        var sql = 'SELECT comment.*,IFNULL(lovecomment.love,0) AS love FROM (' + sql + ') AS comment LEFT JOIN ' + LOVECOMMENT_TABLE + ' ON comment.id = lovecomment.icid ORDER BY id DESC ';
        pool.getConnection(function(err, connection) {
            connection.query(sql, [fromid, iid, type], function(err, result) {
                callback(err, result)
                connection.release();
            });
        });
    },
    /**
     * 根据id查询评论人的userid
     */
    queryCommentFId(id, callback) {
        var sql = 'SELECT comment.userid FROM ' + COMMENT_TABLE + ' AS comment WHERE id = ? LIMIT 1';
        pool.getConnection(function(err, connection) {
            connection.query(sql, [id], function(err, result) {
                callback(err, result)
                connection.release();
            });
        });
    },
}