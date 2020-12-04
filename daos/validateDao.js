var pool = require('./dao');
var utils = require('../utils/utils');
var logger = require('../utils/log4jsutil').logger(__dirname+'/validateDao.js');

var dbTables = require('./dbTables');
var USER_TABLE = dbTables.USER_TABLE;
var VALIDATE_TABLE = dbTables.VALIDATE_TABLE;//验证码


module.exports = {
	// 查询验证 1注册验证码 2修改密码验证码
    queryValidate:function(country_code,phone,type,callback){
        var sql = 'SELECT *, UNIX_TIMESTAMP(update_time) AS time FROM '+VALIDATE_TABLE+' WHERE country_code = ? AND phone = ? AND type = ?';
        pool.getConnection(function(err, connection) {
            connection.query(sql, [country_code,phone,type],function(err, result) {
                callback(err, result)
                connection.release();
            });
        });
    },
    // 添加验证码
    addValidate:function(country_code,phone,type,code,time,callback){
        console.log('addValidate:'+code)
        var sql = 'INSERT INTO '+VALIDATE_TABLE+' (country_code,phone,type,code,create_time,update_time) VALUES (?,?,?,?,?,?)';
        pool.getConnection(function(err, connection) {
            connection.query(sql, [country_code,phone,type,code,time,time],function(err, result) {
                callback(err, result)
                connection.release();
            });
        });
    },
    // 修改验证码
    updateValidate:function(country_code,phone,type,code,time,callback){
        console.log('updateValidate:'+code+'phone:'+phone)
        var sql = 'UPDATE '+VALIDATE_TABLE+' SET code = ? , update_time = ? WHERE country_code = ? AND phone = ? AND type = ?';
        pool.getConnection(function(err, connection) {
            connection.query(sql, [code,time,country_code,phone,type], function(err, result) {
                callback(err, result)
                connection.release();
            });
        });
    },
}