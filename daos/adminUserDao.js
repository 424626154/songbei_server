var _roomdir = "../";
var pool = require('./dao');
var utils = require(_roomdir+'utils/utils'); 
var logger = require(_roomdir+'utils/log4jsutil').logger(__dirname+'/adminUserDao.js');


var dbTables = require('./dbTables');
const ADMIN_USER_TABLE = dbTables.ADMIN_USER_TABLE; 

module.exports = {
	queryAdminUser:function(account,callback){
		var sql = 'SELECT * FROM '+ADMIN_USER_TABLE+' WHERE account = ? LIMIT 1';
		console.log(sql)
        pool.getConnection(function(err, connection) {
            connection.query(sql, account, function(err, result) {
            	callback(err, result)
                connection.release();
            });
        });
	},
}