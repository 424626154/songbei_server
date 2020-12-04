var _roomdir = "../";
var pool = require('./dao');
var utils = require(_roomdir+'utils/utils'); 
var logger = require(_roomdir+'utils/log4jsutil').logger(__dirname+'/messageDao.js');


var dbTables = require('./dbTables');
const PUSH_TABLE = dbTables.PUSH_TABLE; 
const MESSAGE_TABLE = dbTables.MESSAGE_TABLE; 

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
	addMessage:function(type,userid,title,content,extend,callback){
		if(extend instanceof Object){
            extend = JSON.stringify(extend);
        }
        logger.debug(typeof(extend));
        logger.debug(extend);
        var time = utils.getDateTime();
        var sql = 'INSERT INTO '+MESSAGE_TABLE+' (userid,title,content,type,extend,create_time,update_time) VALUES (?,?,?,?,?,?,?)';
        pool.getConnection(function(err, connection) {
            connection.query(sql, [userid,title,content,type,extend,time,time],function(err, result) {
                callback(err, result)
                connection.release();
            });
        });
	},
    addMessages:function(messages,callback){
        var time = utils.getDateTime();
        // var sql = 'INSERT INTO '+MESSAGE_TABLE+' (userid,title,content,type,extend,create_time,update_time) VALUES ';
        // for(var i = 0 ; i < messages.length ; i ++){
        //     var message = messages[i];
        //     var extend = message.extend;
        //     if(extend instanceof Object){
        //         extend = JSON.stringify(extend);
        //     }
        //     sql = sql+'("'+message.userid+'","'+message.title+'","'+message.content+'",'+message.type+',\"'+extend+'\",'+time+','+time+')';
        // }
        // sql = sql.substr(0,sql.length-1)
        // console.log(sql);
        var sql = 'INSERT INTO '+MESSAGE_TABLE+' (userid,title,content,type,extend,create_time,update_time) VALUES ?';
        var values = [];
        for(var i = 0 ; i < messages.length ; i ++){
            var message = messages[i];
            var extend = message.extend;
            if(extend instanceof Object){
                extend = JSON.stringify(extend);
            }
            var value = [message.userid,message.title,message.content,message.type,extend,time,time]
            values.push(value)
        }
        pool.getConnection(function(err, connection) {
            connection.query(sql, [values],function(err, result) {
                callback(err, result)
                connection.release();
            });
        });
    },
    addSysMessages:function(type,userids,title,content,extend,callback){
        if(extend instanceof Object){
            extend = JSON.stringify(extend);
        }
        logger.debug(extend);
        if(userids.length == 0 ){
            callback(new Error('userids 参数错误'), null);
            return;
        }
        var time = utils.getDateTime();
        var sql = 'INSERT INTO '+MESSAGE_TABLE+' (userid,title,content,type,extend,create_time,update_time) VALUES ';
        for(var i = 0 ; i < userids.length ; i ++){
            sql = sql+'("'+userids[i]+'","'+title+'","'+content+'",'+type+',\''+extend+'\',\"'+time+'\",\"'+time+'\")';
        }
        sql = sql.substr(0,sql.length-1)
        console.log(sql);
        pool.getConnection(function(err, connection) {
            connection.query(sql, function(err, result) {
                callback(err, result)
                connection.release();
            });
        });
    },
	getMessage:function(msgid,callback){
		var sql = 'SELECT *,  UNIX_TIMESTAMP(update_time) AS time FROM '+MESSAGE_TABLE+' WHERE id = '+msgid;
        pool.getConnection(function(err, connection) {
            connection.query(sql, function(err, result) {
                callback(err, result)
                connection.release();
            });
        });
	},
	getMessages:function(userid,callback){
		var sql = 'SELECT *,  UNIX_TIMESTAMP(update_time) AS time FROM '+MESSAGE_TABLE+' WHERE userid = "'+userid+'" AND state = 0  ';
        pool.getConnection(function(err, connection) {
            connection.query(sql, function(err, result) {
                callback(err, result)
                connection.release();
            });
        });
	},
	setMessageRead:function(userid,reads,callback){
// 		INSERT INTO t_member (id, name, email) VALUES
//     (1, 'nick', 'nick@126.com'),
//     (4, 'angel','angel@163.com'),
//     (7, 'brank','ba198@126.com')
// ON DUPLICATE KEY UPDATE name=VALUES(name), email=VALUES(email)
		var sql = 'INSERT INTO '+MESSAGE_TABLE+' (id,state) VALUES '
		for(var i = 0 ; i < reads.length ; i ++){
		sql = sql + '('+reads[i]+',1),'
		}
		sql = sql.substr(0,sql.length-1)
		sql = sql + ' ON DUPLICATE KEY UPDATE state = VALUES(state)';
		console.log(sql);
		pool.getConnection(function(err, connection) {
            connection.query(sql, function(err, result) {
                callback(err, result)
                connection.release();
            });
        });
	}
}