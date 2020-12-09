var _roomdir = "../";
var logger = require(_roomdir+'utils/log4jsutil').logger(__dirname+'/blacklistDao.js');
var pool = require('./dao');
var utils = require(_roomdir+'utils/utils'); 

var dbTables = require('./dbTables');
const BLACKLIST_TABLE = dbTables.BLACKLIST_TABLE; 
const USER_TABLE = dbTables.USER_TABLE;
module.exports = {
	/**
	 * 添加举报
	 */
	addBlackList(userid,buserid,callback){
		var time = utils.getDateTime();
        var sql = 'INSERT INTO '+BLACKLIST_TABLE+' (userid,buserid,create_time) VALUES (?,?,?)';
        pool.getConnection(function(err, connection) {
            connection.query(sql,[userid,buserid,time], function(err, result) {
                callback(err, result)
                connection.release();
            });
        });
	},
    queryBlackList:function(userid,callback){
        var sql_black = 'SELECT * FROM '+BLACKLIST_TABLE+' WHERE del = 0 AND userid = ? ORDER BY id DESC';
        var sql_user = 'SELECT temp.*,user.avatarUrl AS head ,user.nickName AS nickname FROM (' + sql_black + ') AS temp LEFT JOIN ' + USER_TABLE + ' AS user ON temp.buserid = user.userid';
        var sql = sql_user;
        pool.getConnection(function(err, connection) {
            connection.query(sql, [userid],function(err, result) {
                callback(err, result)
                connection.release();
            });
        });
    },
    queryBlack:function(userid,buserid,callback){
        var sql = 'SELECT * FROM '+BLACKLIST_TABLE+' WHERE del = 0 AND userid = ? AND buserid = ? ORDER BY id DESC';
        pool.getConnection(function(err, connection) {
            connection.query(sql, [userid,buserid],function(err, result) {
                callback(err, result)
                connection.release();
            });
        });
    },
    queryPullBlack:function(userid,buserid,callback){
        var sql = 'SELECT * FROM '+BLACKLIST_TABLE+' WHERE del = 0 AND ((userid = ? AND buserid = ?) OR  (buserid = ? AND userid = ?)) ORDER BY id DESC';
        pool.getConnection(function(err, connection) {
            connection.query(sql, [userid,buserid,buserid,userid],function(err, result) {
                callback(err, result)
                connection.release();
            });
        });
    },
    deleteBlackList:function(userid,buserid,callback){
        var sql = 'UPDATE '+BLACKLIST_TABLE+' SET del = 1 WHERE userid = ? AND buserid = ? ';
        pool.getConnection(function(err, connection) {
            connection.query(sql, [userid,buserid], function(err, result) {
                callback(err, result)
                connection.release();
            });
        });
    },

}