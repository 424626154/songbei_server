var _roomdir = "../";
var logger = require(_roomdir + 'utils/log4jsutil').logger(__dirname + '/secondhandDao.js');
var pool = require('./dao');
var utils = require(_roomdir + 'utils/utils');
var dbTables = require('./dbTables');

const SECONDHAND_TABLE = dbTables.SECONDHAND_TABLE;
const USER_TABLE = dbTables.USER_TABLE;

module.exports = {
	addSecondhand:function(userid,title,content,extend,price,callback){
        if(extend instanceof Object){
            extend = JSON.stringify(extend);
        }
        var time = utils.getDateTime();
        var sql = 'INSERT INTO '+SECONDHAND_TABLE+' (userid,title,content,extend,price,create_time) VALUES (?,?,?,?,?,?)';
        pool.getConnection(function(err, connection) {
            connection.query(sql, [userid,title,content,extend,price,time], function(err, result) {
                if(err){
                    callback(err, result)
                    connection.release();
                }else{
                    let id = result.insertId;
                    sql = 'SELECT * FROM '+SECONDHAND_TABLE+' WHERE id = ?';
                    sql = 'SELECT discuss.*,user.head,user.nickname FROM ('+sql+') AS discuss LEFT JOIN '+USER_TABLE+' AS user ON discuss.userid = user.userid';
                    connection.query(sql, [id], function(err, result) {
                        callback(err, result)
                        connection.release();
                    });                                  
                }
            });
        });
    },
    querySecondhands:function(userid,callback){
		var sql = 'SELECT * ,UNIX_TIMESTAMP(create_time) AS time FROM '+SECONDHAND_TABLE+' WHERE del = 0  ORDER BY id DESC  ';
        sql = 'SELECT form.*,user.head,user.nickname  FROM ('+sql+') AS form LEFT JOIN '+USER_TABLE+' AS user ON form.userid = user.userid';
       	pool.getConnection(function(err, connection) {
            connection.query(sql,function(err, result) {
                if(err){
                    callback(err, null)
                    connection.release();
                }else{
                    var data = {};
                    data.items = result;
                    sql = 'SELECT count(*) FROM '+SECONDHAND_TABLE+' WHERE del = 0';
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
    querySecondhand:function(id,callback){
        var sql = 'SELECT * ,UNIX_TIMESTAMP(create_time) AS time FROM '+SECONDHAND_TABLE+' WHERE id = ? AND del = 0  ORDER BY id DESC  LIMIT 1';
        sql = 'SELECT form.*,user.head,user.nickname  FROM ('+sql+') AS form LEFT JOIN '+USER_TABLE+' AS user ON form.userid = user.userid';
        pool.getConnection(function(err, connection) {
            connection.query(sql,[id], function(err, result) {
                callback(err, result)
                connection.release();
            });
        });
    },
    delSecondhand:function(userid,id,callback){
        var sql = 'UPDATE '+SECONDHAND_TABLE+' SET del = 1 WHERE id = ? AND userid = ?';
        pool.getConnection(function(err, connection) {
            connection.query(sql, [id,userid], function(err, result) {
                callback(err, result)
                connection.release();
            });
        });
    }
}