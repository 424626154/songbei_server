var _roomdir = "../";
var logger = require(_roomdir + 'utils/log4jsutil').logger(__dirname + '/datingDao.js');
var pool = require('./dao');
var utils = require(_roomdir + 'utils/utils');
var dbTables = require('./dbTables');

const DATING_TABLE = dbTables.DATING_TABLE;
const USER_TABLE = dbTables.USER_TABLE;

module.exports = {
    addInfo:function(userid,gender,birth_date,height,weight,degree,location,self_describe,callback){
        var time = utils.getDateTime();
        var sql = 'INSERT INTO '+DATING_TABLE+' (userid,gender,birth_date,height,weight,degree,location,self_describe,create_time,update_time) VALUES (?,?,?,?,?,?,?,?,?,?)'
        +' ON DUPLICATE KEY UPDATE gender = ? , birth_date = ? , height = ? , weight = ? , degree = ? , location = ? , self_describe = ? , update_time = ?';
        pool.getConnection(function(err, connection) {
            connection.query(sql, [userid,gender,birth_date,height,weight,degree,location,self_describe,time,time,gender,birth_date,height,weight,degree,location,self_describe,time], function(err, result) {
                callback(err, result)
                connection.release();  
            });
        });
    },
	queryInfo: function(userid, callback) {
        var sql_dating = 'SELECT * FROM ' + DATING_TABLE + ' WHERE userid = ? LIMIT 1';
        var left_user = 'LEFT JOIN ' + USER_TABLE + ' ON dating.userid = ' + USER_TABLE + '.userid';
        var sql = 'SELECT dating.*,' + USER_TABLE + '.head,' + USER_TABLE + '.nickname,' + USER_TABLE + '.profile FROM (' + sql_dating + ') AS dating ' + left_user;
        pool.getConnection(function(err, connection) {
            try {
                connection.query(sql, userid, function(err, result) {
                    callback(err, result)
                    connection.release();
                });
            } catch (err) {
                logger.error(err);
                callback(err, null);
            }
        });
    },
    queryDatings: function(callback) {
        var sql_dating = 'SELECT * FROM ' + DATING_TABLE + ' WHERE state = ? ';
        var left_user = 'LEFT JOIN ' + USER_TABLE + ' ON dating.userid = ' + USER_TABLE + '.userid';
        var sql = 'SELECT dating.*,' + USER_TABLE + '.head,' + USER_TABLE + '.nickname,' + USER_TABLE + '.profile FROM (' + sql_dating + ') AS dating ' + left_user;
        pool.getConnection(function(err, connection) {
            try {
                connection.query(sql, 1, function(err, result) {
                    callback(err, result)
                    connection.release();
                });
            } catch (err) {
                logger.error(err);
                callback(err, null);
            }
        });
    },
    upState:function(userid,state,callback){
        var sql = 'UPDATE ' + DATING_TABLE + ' SET state = ? WHERE userid = ? ';
        pool.getConnection(function(err, connection) {
            connection.query(sql, [state, userid], function(err, result) {
                callback(err, result)
                connection.release();
            });
        });
    }
}