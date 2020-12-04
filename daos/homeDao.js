var _roomdir = "../";
var pool = require('./dao');
var utils = require(_roomdir+'utils/utils');
var logger = require(_roomdir+'utils/log4jsutil').logger(__dirname + '/homeDao.js');
var dbTables = require('./dbTables');

const HOME_TABLE = dbTables.HOME_TABLE;

const PAGE_SIZE = 10;

module.exports = {
    addHomeConfig(home_config,callback){
        var time = utils.getDateTime();
        var sql = 'INSERT INTO ' + HOME_TABLE + ' (home_config,create_time,update_time) VALUES (?,?,?)';
        pool.getConnection(function(err, connection) {
            connection.query(sql, [home_config,time,time], function(err, result) {
                callback(err, result)
                connection.release();
            });
        });
    },
	queryHome(callback) {
        var sql = 'SELECT * , UNIX_TIMESTAMP(update_time) AS time FROM ' + HOME_TABLE + ' ORDER BY id DESC LIMIT  1';
        pool.getConnection(function(err, connection) {
            connection.query(sql, function(err, result) {
                callback(err, result)
                connection.release();
            });
        });
    },
    upHomeConfig(id,home_config,callback){
        console.log('-----upHomeConfig')
        var time = utils.getDateTime();
        var sql = 'UPDATE ' + HOME_TABLE + ' SET home_config = ? ,update_time = ? WHERE id = ? ';
        pool.getConnection(function(err, connection) {
            connection.query(sql, [home_config,time,id], function(err, result) {
                callback(err, result)
                connection.release();
            });
        });
    },
}