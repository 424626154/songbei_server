var _roomdir = "../";
var logger = require(_roomdir+'utils/log4jsutil').logger(__dirname+'/starDao.js');
var pool = require('./dao');
var utils = require(_roomdir+'utils/utils'); 
var dbTables = require('./dbTables'); 

const STAR_TABLE = dbTables.STAR_TABLE; 
const DISCUSS_TABLE = dbTables.DISCUSS_TABLE; 
const LIMIT_NUM = '100';

module.exports = {
	/**
	 * 收藏取消
	 */
	upStar(userid,type,sid,star,callback){
        var time = utils.getDateTime();
        var select_Sql = 'SELECT * FROM '+STAR_TABLE+' WHERE sid ='+sid+' AND userid = "'+userid+'" AND type = '+type+' ORDER BY sid DESC LIMIT 1';
        pool.getConnection(function(err, connection) {
            connection.query(select_Sql,function(err,result){
                if(err){
                    callback(err, result)
                    connection.release();   
                }else{
                    console.log(result.length)
                     var sql = '';
                    if(result.length > 0){
                        sql = 'UPDATE '+STAR_TABLE+' SET star='+star+',update_time=\"'+time+'\" WHERE sid ='+sid+' AND userid = "'+userid+'" AND type = '+type;
                    }else{
                        sql = 'INSERT INTO '+STAR_TABLE+' (userid,type,sid,star,create_time,update_time) VALUES ("'+userid+'",'+type+','+sid+','+star+',\"'+time+'\",\"'+time+'\")';
                    }
                    console.log(sql)
                    connection.query(sql,function(err,result){
                       callback(err, result)
                       connection.release();  
                    });
                }
            
            });
        });
	},
    queryNStars(userid,type,id,callback){
        var star_sql = 'SELECT * FROM '+STAR_TABLE+' WHERE sid > ? AND userid = ? AND type = ? AND star = 1 AND del = 0 ORDER BY sid DESC LIMIT '+LIMIT_NUM;
        var sql = 'SELECT '+DISCUSS_TABLE+'.* , UNIX_TIMESTAMP('+DISCUSS_TABLE+'.create_time) AS time FROM ('+star_sql+') AS star LEFT JOIN '+DISCUSS_TABLE+' ON star.sid = discuss.id';
        pool.getConnection(function(err, connection) {
            connection.query(sql, [id,userid,type], function(err, result) {
                if(err){
                    callback(err, result)
                    connection.release();
                }else{
                    var data = {};
                    data.stars = result;
                    sql = 'SELECT count(*) FROM '+STAR_TABLE+' WHERE userid = ? AND star = 1 AND del = 0';
                    connection.query(sql, [userid], function(err, result) {
                        if(!err){
                            data.count = result[0]['count(*)'];
                        }
                        callback(err, data)
                        connection.release();
                    }); 
                }
            });
        });
    },
    queryHStars(userid,type,id,callback){
        var star_sql = 'SELECT * FROM '+STAR_TABLE+' WHERE sid < ? AND userid = ? AND type = ? AND star = 1  AND del = 0 ORDER BY sid DESC LIMIT '+LIMIT_NUM;
        var sql = 'SELECT '+DISCUSS_TABLE+'.* , UNIX_TIMESTAMP('+DISCUSS_TABLE+'.create_time) AS time FROM ('+star_sql+') AS star LEFT JOIN '+DISCUSS_TABLE+' ON star.sid = discuss.id';
        pool.getConnection(function(err, connection) {
            connection.query(sql, [id,userid,type], function(err, result) {
                if(err){
                    callback(err, result)
                    connection.release();
                }else{
                    var data = {};
                    data.stars = result;
                    sql = 'SELECT count(*) FROM '+STAR_TABLE+' WHERE userid = ? AND star = 1 AND del = 0';
                    connection.query(sql, [userid], function(err, result) {
                        if(!err){
                            data.count = result[0]['count(*)'];
                        }
                        callback(err, data)
                        connection.release();
                    }); 
                }
            });
        });
    },

}