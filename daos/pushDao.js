var _roomdir = "../";
var pool = require('./dao');
var utils = require(_roomdir+'utils/utils'); 
var logger = require(_roomdir+'utils/log4jsutil').logger(__dirname+'/pushDao.js');


var dbTables = require('./dbTables');
const PUSH_TABLE = dbTables.PUSH_TABLE; 

module.exports = {
	addPushId:function(userid,pushid,os,callback){
		var time = utils.getDateTime();
        var sql = 'INSERT INTO '+PUSH_TABLE+' (userid,pushid,os,create_time,update_time) VALUES ("'+userid+'","'+pushid+'","'+os+'",\"'+time+'\",\"'+time+'\") ON DUPLICATE KEY UPDATE pushid="'+pushid+'",os="'+os+'",update_time=\"'+time+'\"';
        pool.getConnection(function(err, connection) {
            connection.query(sql, function(err, result) {
                callback(err, result)
                connection.release();
            });
        });
	},
	getPush:function(userid,callback){
		var sql = 'SELECT *,  UNIX_TIMESTAMP(update_time) AS time FROM '+PUSH_TABLE+' WHERE userid = "'+userid+'"';
        pool.getConnection(function(err, connection) {
            connection.query(sql, function(err, result) {
                callback(err, result)
                connection.release();
            });
        });
	},
    getPushs:function(userids,callback){
        // where id in('276','306','325')
        var userids_str = '';
        for(var i = 0 ; i < userids.length ; i++){
            userids_str += '"'+userids[i]+'"';
            if(i != userids.length - 1){
                userids_str += ','
            }
        }
        logger.info(userids_str)
        var sql = 'SELECT *,  UNIX_TIMESTAMP(update_time) AS time FROM '+PUSH_TABLE+' WHERE userid in ('+userids_str+')';
        pool.getConnection(function(err, connection) {
            connection.query(sql, function(err, result) {
                callback(err, result)
                connection.release();
            });
        });
    },
}