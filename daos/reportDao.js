var _roomdir = "../";
var logger = require(_roomdir+'utils/log4jsutil').logger(__dirname+'/reportDao.js');
var pool = require('./dao');
var utils = require(_roomdir+'utils/utils'); 

var tables = require('./dbTables');
const REPORT_TABLE = tables.REPORT_TABLE; 
module.exports = {
	/**
	 * 添加举报
	 */
	addReport(userid,type,report,custom,rid,ruserid,callback){
		var time = utils.getDateTime();
        var sql = 'INSERT INTO '+REPORT_TABLE+' (userid,type,report,custom,rid,ruserid,time) VALUES (?,?,?,?,?,?,?)';
        pool.getConnection(function(err, connection) {
            connection.query(sql,[userid,type,report,custom,rid,ruserid,time], function(err, result) {
                callback(err, result)
                connection.release();
            });
        });
	},
    queryReports:function(callback){
        var sql = 'SELECT * FROM '+REPORT_TABLE+' WHERE del = 0 ORDER BY id DESC';
        pool.getConnection(function(err, connection) {
            connection.query(sql, function(err, result) {
                callback(err, result)
                connection.release();
            });
        });
    },
    queryReport:function(id,callback){
        var sql = 'SELECT * FROM '+REPORT_TABLE+' WHERE id = ? ORDER BY id DESC LIMIT 1';
        pool.getConnection(function(err, connection) {
            connection.query(sql, id, function(err, result) {
                callback(err, result)
                connection.release();
            });
        });
    },
    deleteReport:function(id,callback){
        var sql = 'UPDATE '+REPORT_TABLE+' SET del = 1 WHERE id = ? ';
        pool.getConnection(function(err, connection) {
            connection.query(sql, id, function(err, result) {
                callback(err, result)
                connection.release();
            });
        });
    },
    upReportState:function(id,state,callback){
        var sql = 'UPDATE '+REPORT_TABLE+' SET state = ? WHERE id = ? ';
        pool.getConnection(function(err, connection) {
            connection.query(sql, [state,id], function(err, result) {
                callback(err, result)
                connection.release();
            });
        });
    },

}