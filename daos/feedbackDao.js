var _roomdir = "../";
var logger = require(_roomdir+'utils/log4jsutil').logger(__dirname+'/feedbackDao.js');
var pool = require('./dao');
var utils = require(_roomdir+'utils/utils');

var dbTables = require('./dbTables'); 

const ADMIN_FEEDBACK_TABLE = dbTables.ADMIN_FEEDBACK_TABLE; 

module.exports = {
	addFeedback:function(feedback,userid,contact,callback){
		var time = utils.getDateTime();
		var sql = 'INSERT INTO '+ADMIN_FEEDBACK_TABLE+' (userid,feedback,contact,create_time) VALUES (?,?,?,?)';
        pool.getConnection(function(err, connection) {
            connection.query(sql, [userid,feedback,contact,time], function(err, result) {
            	callback(err, result)
                connection.release();
            });
        });
	},
	queryFeedbacks(callback){
		var sql = 'SELECT * ,UNIX_TIMESTAMP(create_time) AS time FROM '+ADMIN_FEEDBACK_TABLE+' WHERE del = 0 ORDER BY id DESC';
        pool.getConnection(function(err, connection) {
            connection.query(sql, function(err, result) {
            	callback(err, result)
                connection.release();
            });
        });
	},
    delFeedback(id,callback){
        var sql = 'UPDATE '+ADMIN_FEEDBACK_TABLE+' SET del = 1 WHERE id = ? ';
        pool.getConnection(function(err, connection) {
            connection.query(sql, id, function(err, result) {
                callback(err, result)
                connection.release();
            });
        });
    }
}