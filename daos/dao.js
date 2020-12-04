var mysql = require('mysql');
var $conf = require('../conf/db');
var mysqldb = require('../conf/config').server.mysqldb;
var utils = require('../utils/utils');
var logger = require('../utils/log4jsutil').logger(__dirname+'/dao.js');

var dbconf = $conf.mysql;
if(mysqldb == 'docker'){
	dbconf = $conf.docker_mysql;
}else if(mysqldb == 'ali'){
	dbconf = $conf.ali_mysql;
}
logger.info('---mysqldb:'+mysqldb);
logger.info(dbconf)
// 使用连接池，提升性能
var pool  = mysql.createPool(dbconf);
pool.getConnection(function(err, connection) {
  // connected! (unless `err` is set)
  if(err){
  	 logger.error(err)  
  }
});

module.exports = pool;