var _roomdir = "../";
var logger = require(_roomdir+'utils/log4jsutil').logger(__dirname+'/discussDao.js');
var pool = require('./dao');
var utils = require(_roomdir+'utils/utils'); 
var dbTables = require('./dbTables'); 

const DISCUSS_TABLE = dbTables.DISCUSS_TABLE; 
const USER_TABLE = dbTables.USER_TABLE;
const LOVE_TABLE = dbTables.LOVE_TABLE;
const COMMENT_TABLE = dbTables.COMMENT_TABLE;
const STAR_TABLE = dbTables.STAR_TABLE;
const LIMIT_NUM = '20';
const POST_TYPE = 1;

module.exports = {
    /*------------作品------------*/
    /**
     * 添加作品
     */
    addDiscuss:function(userid,type,title,content,extend,callback){
        if(extend instanceof Object){
            extend = JSON.stringify(extend);
        }
        var time = utils.getDateTime();
        var sql = 'INSERT INTO '+DISCUSS_TABLE+' (userid,type,title,content,extend,create_time) VALUES (?,?,?,?,?,?)';
        pool.getConnection(function(err, connection) {
            connection.query(sql, [userid,type,title,content,extend,time], function(err, result) {
                if(err){
                    callback(err, result)
                    connection.release();
                }else{
                    let id = result.insertId;
                    sql = 'SELECT * FROM '+DISCUSS_TABLE+' WHERE id = ?';
                    sql = 'SELECT discuss.*,user.head,user.nickname FROM ('+sql+') AS discuss LEFT JOIN '+USER_TABLE+' AS user ON discuss.userid = user.userid';
                    connection.query(sql, [id], function(err, result) {
                        callback(err, result)
                        connection.release();
                    });                                  
                }
            });
        });
    },
    addClassifyDiscuss:function(userid,type,c_type,ciid,title,content,extend,callback){
        if(extend instanceof Object){
            extend = JSON.stringify(extend);
        }
        var time = utils.getDateTime();
        var sql = 'INSERT INTO '+DISCUSS_TABLE+' (userid,type,c_type,ciid,title,content,extend,create_time) VALUES (?,?,?,?,?,?,?,?)';
        pool.getConnection(function(err, connection) {
            connection.query(sql, [userid,type,c_type,ciid,title,content,extend,time], function(err, result) {
                if(err){
                    callback(err, result)
                    connection.release();
                }else{
                    let id = result.insertId;
                    sql = 'SELECT * FROM '+DISCUSS_TABLE+' WHERE id = ?';
                    sql = 'SELECT discuss.*,user.head,user.nickname FROM ('+sql+') AS discuss LEFT JOIN '+USER_TABLE+' AS user ON discuss.userid = user.userid';
                    connection.query(sql, [id], function(err, result) {
                        callback(err, result)
                        connection.release();
                    });                                  
                }
            });
        });
    },
    /**
     * 删除作品
     */
    delDiscuss:function(id,userid,callback){
        var sql = 'UPDATE '+DISCUSS_TABLE+' SET del = 1 WHERE id = ? AND userid = ?';
        pool.getConnection(function(err, connection) {
            connection.query(sql, [id,userid], function(err, result) {
                callback(err, result)
                connection.release();
            });
        });
    },
    delAdminDiscuss:function(id,callback){
        var sql = 'UPDATE '+DISCUSS_TABLE+' SET del = 1 WHERE id = ? ';
        pool.getConnection(function(err, connection) {
            connection.query(sql, [id], function(err, result) {
                callback(err, result)
                connection.release();
            });
        });
    },
    queryMyDiscuss(userid,callback){
        var sql = 'SELECT * ,UNIX_TIMESTAMP(create_time) AS time FROM '+DISCUSS_TABLE+' WHERE userid = ? AND del = 0 ORDER BY id DESC LIMIT '+LIMIT_NUM;
        sql = 'SELECT form.*,user.head,user.nickname,form.time FROM ('+sql+') AS form LEFT JOIN '+USER_TABLE+' AS user ON form.userid = user.userid';
        pool.getConnection(function(err, connection) {
            connection.query(sql, [userid], function(err, result) {
                    callback(err, result)
                    connection.release();
            });
        });
    },
    /**
     * 查询最新作品 
     */
    queryNMyDiscuss(userid,fromid,callback){
        var sql = 'SELECT * ,UNIX_TIMESTAMP(create_time) AS time FROM '+DISCUSS_TABLE+' WHERE id>? AND userid = ? AND del = 0 ORDER BY id DESC LIMIT '+LIMIT_NUM;
        sql = 'SELECT form.*,user.head,user.nickname,form.time FROM ('+sql+') AS form LEFT JOIN '+USER_TABLE+' AS user ON form.userid = user.userid';
        pool.getConnection(function(err, connection) {
            connection.query(sql, [fromid,userid], function(err, result) {
                if(err){
                    callback(err, result)
                    connection.release();
                }else{
                    var data = {};
                    data.discuss = result;
                    sql = 'SELECT count(*) FROM '+DISCUSS_TABLE+' WHERE userid = ? AND del = 0';
                    connection.query(sql, [userid], function(err, result) {
                        if(!err){
                            data.count = result[0]['count(*)'];
                        }
                        callback(err, data)
                        connection.release();
                    }); 
                }
            });
        });
    },
    /**
     * 查询历史作品
     */
    queryHMyDiscuss(userid,fromid,callback){
        var sql = 'SELECT * ,UNIX_TIMESTAMP(create_time) AS time FROM '+DISCUSS_TABLE+' WHERE id<? AND userid = ? AND del = 0  ORDER BY id DESC LIMIT '+LIMIT_NUM;
        sql = 'SELECT form.*,user.head,user.nickname,form.time FROM ('+sql+') AS form LEFT JOIN '+USER_TABLE+' AS user ON form.userid = user.userid';
        pool.getConnection(function(err, connection) {
            connection.query(sql, [fromid,userid], function(err, result) {
                if(err){
                    callback(err, result)
                    connection.release();
                }else{
                    var data = {};
                    data.discuss = result;
                    sql = 'SELECT count(*) FROM '+DISCUSS_TABLE+' WHERE userid = ? AND del = 0';
                    connection.query(sql,[userid], function(err, result) {
                        if(!err){
                            data.count = result[0]['count(*)'];
                        }
                        callback(err, data)
                        connection.release();
                    }); 
                }
            });
        });
    },
    /**
     * 查询作品基本信息
     */
    queryDiscuss(id,callback){
        var sql = 'SELECT * ,UNIX_TIMESTAMP(create_time) AS time FROM '+DISCUSS_TABLE+' WHERE id = ? AND del = 0 LIMIT 1';
        pool.getConnection(function(err, connection) {
            connection.query(sql, id, function(err, result) {
                callback(err, result)
                connection.release();
            });
        });
    },
        /**
     *作品详情
     */
    queryDiscussInfo(id,userid,callback){
        var poem_sql = 'SELECT * ,UNIX_TIMESTAMP(create_time) AS time FROM '+DISCUSS_TABLE+' WHERE id = '+id+' LIMIT 1';
        var love_sql = 'SELECT * FROM '+LOVE_TABLE+' WHERE iid = '+id+' AND type = '+POST_TYPE+' AND userid = "'+userid+'" LIMIT 1';
        // var user_sql = 'SELECT * FROM '+USER_TABLE+' WHERE userid = "'+userid+'" LIMIT 1';
        var star_sql = 'SELECT * FROM '+STAR_TABLE+' WHERE sid = '+id+' AND type = '+POST_TYPE+' AND userid = "'+userid+'" LIMIT 1';
        console.log(star_sql)
        var sql = poem_sql+';'+love_sql+';'+star_sql;
        pool.getConnection(function(err, connection) {
            connection.query(sql, function(err, result) {
                if(err){
                    callback(err, result)
                    connection.release();
                }else{
                    var obj = {};
                    if(result[0].length > 0){
                        obj = result[0][0];
                        obj.love = 0;
                        if(result[1].length > 0){
                            console.log('------love------')
                            console.log(result[1][0])
                            obj.mylove = result[1][0].love;
                        }
                        if(result[2].length > 0){
                            obj.mystar = result[2][0].star;
                            console.log('------star------')
                            console.log(result[2][0])
                        }
                        var user_sql = 'SELECT * FROM '+USER_TABLE+' WHERE userid = "'+obj.userid+'" LIMIT 1';
                        connection.query(user_sql, function(err, result) {
                            if(result.length > 0){
                                obj.nickname = result[0].nickname;
                                obj.head = result[0].head;
                            }
                            callback(err, obj)
                            connection.release();
                        })
                    }else{
                        callback('作品ID失效', null)
                        connection.release();
                    }
                }
            });
        });
    },
    queryOpDiscuss(id,opuserid,callback){
        pool.getConnection(function(err, connection) {
            connection.beginTransaction(function(err){
                var poem = {};
                var user = {};
                var opuser = {};
                var userid = '';
                var sql0 = 'SELECT * FROM '+DISCUSS_TABLE+' WHERE id = '+id+' LIMIT 1';
                logger.debug('---sql0---');
                connection.query(sql0, function(err, result) {
                    // logger.debug(sql0);
                    // logger.debug(err);
                    // logger.debug(result);
                    if(err){

                    }else{
                        if(result.length > 0){
                         poem = result[0];
                         userid = poem.userid;
                         logger.debug(userid);
                            logger.debug('---sql1---');
                            var sql1 = 'SELECT * FROM '+USER_TABLE+' WHERE userid = "'+userid+'" LIMIT 1';
                            connection.query(sql1, function(err, result) {
                                // logger.debug(sql1);
                                // logger.debug(err);
                                // logger.debug(result);
                                if(err){

                                }else{
                                    if(result.length > 0){
                                     user = result[0];
                                     poem.head = user.head;
                                     poem.nickname = user.nickname;
                                        logger.debug('---sql2---');
                                        var sql2 = 'SELECT * FROM '+USER_TABLE+' WHERE userid = "'+opuserid+'" LIMIT 1';
                                        connection.query(sql2, function(err, result) {
                                            // logger.debug(sql2);
                                            // logger.debug(err);
                                            // logger.debug(result);
                                            if(err){

                                            }else{
                                                if(result.length > 0){
                                                 opuser = result[0];
                                                 poem.opuser = opuser.userid
                                                 poem.ophead = opuser.head;
                                                 poem.opnickname = opuser.nickname;
                                                }
                                                connection.commit(function(err){
                                                    // logger.debug('---queryOpLovePoem事务完成---');
                                                    // logger.debug(err);
                                                    // logger.debug(poem);
                                                    callback(err,poem);
                                                });
                                                connection.release();
                                            }
                                        });
                                    }
                                }
                            });
                        }
    
                    }
                });
            });
        });
    },
    /**
     *查询最新讨论圈
     */
    queryNDiscuss(fromid,userid,callback){
        // userid = '';
        var sql = 'SELECT * ,UNIX_TIMESTAMP(create_time) AS time FROM '+DISCUSS_TABLE+' WHERE id>? AND c_type = 0 AND del = 0  ORDER BY id DESC LIMIT '+LIMIT_NUM;
        sql = 'SELECT form.*,user.head,user.nickname  FROM ('+sql+') AS form LEFT JOIN '+USER_TABLE+' AS user ON form.userid = user.userid';
        var sql1 = 'SELECT * FROM '+LOVE_TABLE+' WHERE userid = ? AND type = '+POST_TYPE
        sql = 'SELECT tdiscuss.*,IFNULL(love.love,0) as mylove FROM ('+sql+') AS tdiscuss LEFT JOIN ('+sql1+') AS love ON tdiscuss.id = love.iid ORDER BY id DESC';
        var sql2 = 'SELECT * FROM '+STAR_TABLE+' WHERE userid = ? AND type = '+POST_TYPE
        sql = 'SELECT tdiscuss.*,IFNULL(star.star,0) as mystar FROM ('+sql+') AS tdiscuss LEFT JOIN ('+sql2+') AS star ON tdiscuss.id = star.sid ORDER BY id DESC';
        pool.getConnection(function(err, connection) {
            connection.query(sql, [fromid,userid,userid], function(err, result) {
                if(err){
                    callback(err, null)
                    connection.release();
                }else{
                    var data = {};
                    data.discuss = result;
                    sql = 'SELECT count(*) FROM '+DISCUSS_TABLE+' WHERE del = 0';
                    connection.query(sql, function(err, result) {
                        if(!err){
                            data.count = result[0]['count(*)'];
                        }
                        callback(err, data)
                        connection.release();
                    }); 
                }
            });
        });
    },
    /**
     *查询历史讨论圈
     */
    queryHDiscuss(fromid,userid,callback){
        var sql = 'SELECT * ,UNIX_TIMESTAMP(create_time) AS time FROM '+DISCUSS_TABLE+' WHERE id < ?  AND c_type = 0 AND del = 0 ORDER BY id DESC LIMIT '+LIMIT_NUM;
        sql = 'SELECT form.*,user.head,user.nickname FROM ('+sql+') AS form LEFT JOIN '+USER_TABLE+' ON form.userid = user.userid';
        var sql1 = 'SELECT * FROM '+LOVE_TABLE+' WHERE userid = ?  AND type = '+POST_TYPE
        sql = 'SELECT tpoem.*,IFNULL(love.love,0) as mylove FROM ('+sql+') AS tpoem LEFT JOIN ('+sql1+') AS love ON tpoem.id = love.iid ORDER BY id DESC';
        var sql2 = 'SELECT * FROM '+STAR_TABLE+' WHERE userid = ? AND type = '+POST_TYPE
        sql = 'SELECT tdiscuss.*,IFNULL(star.star,0) as mystar FROM ('+sql+') AS tdiscuss LEFT JOIN ('+sql2+') AS star ON tdiscuss.id = star.sid ORDER BY id DESC';
        pool.getConnection(function(err, connection) {
            connection.query(sql, [fromid,userid,userid], function(err, result) {
                if(err){
                    callback(err, null)
                    connection.release();
                }else{
                    var data = {};
                    data.discuss = result;
                    sql = 'SELECT count(*) FROM '+DISCUSS_TABLE+' WHERE del = 0';
                    connection.query(sql, function(err, result) {
                        if(!err){
                            data.count = result[0]['count(*)'];
                        }
                        callback(err, data)
                        connection.release();
                    }); 
                }
            });
        });
    },
    /**
     *查询分栏
     */
    queryCDiscuss(fromid,userid,c_type,ciid,callback){
        var sql = 'SELECT * ,UNIX_TIMESTAMP(create_time) AS time FROM '+DISCUSS_TABLE+' WHERE c_type = ? AND ciid = ? AND del = 0  ORDER BY id DESC  ';
        sql = 'SELECT form.*,user.head,user.nickname  FROM ('+sql+') AS form LEFT JOIN '+USER_TABLE+' AS user ON form.userid = user.userid';
        var sql1 = 'SELECT * FROM '+LOVE_TABLE+' WHERE userid = ? AND type = '+POST_TYPE
        sql = 'SELECT tdiscuss.*,IFNULL(love.love,0) as mylove FROM ('+sql+') AS tdiscuss LEFT JOIN ('+sql1+') AS love ON tdiscuss.id = love.iid ORDER BY id DESC';
        pool.getConnection(function(err, connection) {
            connection.query(sql, [c_type,ciid,userid], function(err, result) {
                if(err){
                    callback(err, null)
                    connection.release();
                }else{
                    var data = {};
                    data.discuss = result;
                    sql = 'SELECT count(*) FROM '+DISCUSS_TABLE+' WHERE del = 0';
                    connection.query(sql, function(err, result) {
                        if(!err){
                            data.count = result[0]['count(*)'];
                        }
                        callback(err, data)
                        connection.release();
                    }); 
                }
            });
        });
    },
    queryHomeDiscuss(fromid,userid,c_type,callback){
        var sql = 'SELECT * ,UNIX_TIMESTAMP(create_time) AS time FROM '+DISCUSS_TABLE+' WHERE c_type = ? AND del = 0  ORDER BY id DESC  ';
        sql = 'SELECT form.*,user.head,user.nickname  FROM ('+sql+') AS form LEFT JOIN '+USER_TABLE+' AS user ON form.userid = user.userid';
        var sql1 = 'SELECT * FROM '+LOVE_TABLE+' WHERE userid = ? AND type = '+POST_TYPE
        sql = 'SELECT tdiscuss.*,IFNULL(love.love,0) as mylove FROM ('+sql+') AS tdiscuss LEFT JOIN ('+sql1+') AS love ON tdiscuss.id = love.iid ORDER BY id DESC';
        var sql2 = 'SELECT * FROM '+STAR_TABLE+' WHERE userid = ? AND type = '+POST_TYPE
        sql = 'SELECT tdiscuss.*,IFNULL(star.star,0) as mystar FROM ('+sql+') AS tdiscuss LEFT JOIN ('+sql2+') AS star ON tdiscuss.id = star.sid ORDER BY id DESC';
        pool.getConnection(function(err, connection) {
            connection.query(sql, [c_type,userid,userid], function(err, result) {
                if(err){
                    callback(err, null)
                    connection.release();
                }else{
                    var data = {};
                    data.discuss = result;
                    sql = 'SELECT count(*) FROM '+DISCUSS_TABLE+' WHERE del = 0';
                    connection.query(sql, function(err, result) {
                        if(!err){
                            data.count = result[0]['count(*)'];
                        }
                        callback(err, data)
                        connection.release();
                    }); 
                }
            });
        });
    },
}
