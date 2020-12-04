var _roomdir = "../";
var logger = require(_roomdir+'utils/log4jsutil').logger(__dirname+'/qiniuconfDao.js');
var pool = require('./dao');
var utils = require(_roomdir+'utils/utils'); 

var tables = require('./dbTables');
var QINICONF_TABLE = tables.QINICONF_TABLE;


module.exports = {
	addQiniuToken(access_key,qiniu_token,expires_in,callback){
		var time = utils.getDateTime();
		var sql = 'INSERT INTO '+QINICONF_TABLE+' (access_key,qiniu_token,expires_in,create_time,update_time) VALUES (?,?,?,?,?) ON DUPLICATE KEY UPDATE qiniu_token = ? , expires_in = ? , update_time = ?';
		pool.getConnection(function(err, connection) {
            connection.query(sql, [access_key,qiniu_token,expires_in,time,time,qiniu_token,expires_in,time], function(err, result) {
                callback(err, result)
                connection.release();  
            });
        });
	},
	queryQiniuToken(access_key,callback){
		var sql = 'SELECT * , UNIX_TIMESTAMP(update_time) AS update_time FROM '+QINICONF_TABLE+' WHERE access_key = ?';
		pool.getConnection(function(err, connection) {
            connection.query(sql,[access_key],function(err, result) {
                callback(err, result)
                connection.release();  
            });
        });
	}
}