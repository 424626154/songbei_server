var _roomdir = "../";
var pool = require('./dao');
var utils = require(_roomdir + 'utils/utils');
var logger = require(_roomdir + 'utils/log4jsutil').logger(__dirname + '/homeClassifyDao.js');
var dbTables = require('./dbTables');

const HOME_CLASSIFY_TABLE = dbTables.HOME_CLASSIFY_TABLE;
const HOME_CLASSIFY_ITEM_TABLE = dbTables.HOME_CLASSIFY_ITEM_TABLE;

const PAGE_SIZE = 50;
const LIMIT = 20;

module.exports = {
    addClassify(title, brief, logo, type, callback) {
        var time = utils.getDateTime();
        var sql = 'INSERT INTO ' + HOME_CLASSIFY_TABLE + ' (title, brief, logo, type,create_time,update_time) VALUES (?,?,?,?,?,?)';
        pool.getConnection(function(err, connection) {
            connection.query(sql, [title, brief, logo, type, time, time], function(err, result) {
                callback(err, result)
                connection.release();
            });
        });
    },
    queryAPage(cur_page, callback) {
        var count_sql = 'SELECT COUNT(*) FROM ' + HOME_CLASSIFY_TABLE + ' WHERE del = 0 ORDER BY id DESC';
        // var total_page_num_sql = 
        var data = {
            page: {
                total_page_num: 0,
                page_size: PAGE_SIZE,
                cur_page: parseInt(cur_page),
            },
            items: []
        }
        var total_page_num = 0;
        pool.getConnection(function(err, connection) {
            connection.query(count_sql, function(err, result) {
                if (err) {
                    callback(err, data)
                    connection.release();
                } else {
                    if (result.length > 0) {
                        var temp_count = result[0]['COUNT(*)']
                        data.page.total_page_num = total_page_num = temp_count % PAGE_SIZE == 0 ? Math.floor(temp_count / PAGE_SIZE) : Math.floor(temp_count / PAGE_SIZE) + 1;
                    }
                    var sql = 'SELECT * ,  UNIX_TIMESTAMP(update_time) AS time  FROM ' + HOME_CLASSIFY_TABLE + ' WHERE del = 0 ORDER BY id DESC LIMIT ' + (cur_page - 1) * PAGE_SIZE + ' , ' + PAGE_SIZE;
                    connection.query(sql, function(err, result) {
                        if (!err) {
                            data.items = result;
                        }
                        callback(err, data)
                        connection.release();
                    });
                }
            });
        });
    },
    queryAdminClassify(id, callback) {
        var sql = 'SELECT * ,  UNIX_TIMESTAMP(update_time) AS time FROM ' + HOME_CLASSIFY_TABLE + ' WHERE id = ? AND del = 0 ORDER BY id DESC';
        pool.getConnection(function(err, connection) {
            connection.query(sql, [id], function(err, result) {
                callback(err, result)
                connection.release();
            });
        });
    },
    queryClassify(callback) {
        var sql = 'SELECT * ,  UNIX_TIMESTAMP(update_time) AS time FROM ' + HOME_CLASSIFY_TABLE + ' WHERE state = 1 AND del = 0 ORDER BY id DESC';
        pool.getConnection(function(err, connection) {
            connection.query(sql, function(err, result) {
                callback(err, result)
                connection.release();
            });
        });
    },
    upClassify(id, title, brief, logo, type, callback) {
        var time = utils.getDateTime();
        var sql = 'UPDATE ' + HOME_CLASSIFY_TABLE + ' SET title = ? ,brief = ? , logo = ? , type = ? ,update_time = ? , state = 0 WHERE id = ? ';
        pool.getConnection(function(err, connection) {
            connection.query(sql, [title, brief, logo, type, time, id], function(err, result) {
                callback(err, result)
                connection.release();
            });
        });
    },
    updateState(id, state, callback) {
        var sql = 'UPDATE ' + HOME_CLASSIFY_TABLE + ' SET state = ? WHERE id = ? ';
        pool.getConnection(function(err, connection) {
            connection.query(sql, [state, id], function(err, result) {
                callback(err, result)
                connection.release();
            });
        });
    },
    delClassify(id, callback) {
        var sql = 'UPDATE ' + HOME_CLASSIFY_TABLE + ' SET del = 1 WHERE id = ? ';
        pool.getConnection(function(err, connection) {
            connection.query(sql, [id], function(err, result) {
                callback(err, result)
                connection.release();
            });
        });
    },
    addClassifyItem(title, brief, logo, cid, callback) {
        var time = utils.getDateTime();
        var sql = 'INSERT INTO ' + HOME_CLASSIFY_ITEM_TABLE + ' (title, brief, logo, cid,create_time,update_time) VALUES (?,?,?,?,?,?)';
        pool.getConnection(function(err, connection) {
            connection.query(sql, [title, brief, logo, cid, time, time], function(err, result) {
                callback(err, result)
                connection.release();
            });
        });
    },
    queryAItemPage(cur_page, callback) {
        var count_sql = 'SELECT COUNT(*) FROM ' + HOME_CLASSIFY_ITEM_TABLE + ' WHERE del = 0 ORDER BY id DESC';
        // var total_page_num_sql = 
        var data = {
            page: {
                total_page_num: 0,
                page_size: PAGE_SIZE,
                cur_page: parseInt(cur_page),
            },
            items: []
        }
        var total_page_num = 0;
        pool.getConnection(function(err, connection) {
            connection.query(count_sql, function(err, result) {
                if (err) {
                    callback(err, data)
                    connection.release();
                } else {
                    if (result.length > 0) {
                        var temp_count = result[0]['COUNT(*)']
                        data.page.total_page_num = total_page_num = temp_count % PAGE_SIZE == 0 ? Math.floor(temp_count / PAGE_SIZE) : Math.floor(temp_count / PAGE_SIZE) + 1;
                    }
                    var sql_classify = 'SELECT * ,  UNIX_TIMESTAMP(update_time) AS time  FROM ' + HOME_CLASSIFY_ITEM_TABLE + ' WHERE del = 0 ORDER BY id DESC LIMIT ' + (cur_page - 1) * PAGE_SIZE + ' , ' + PAGE_SIZE;
                    var left_classify = 'LEFT JOIN ' + HOME_CLASSIFY_TABLE + ' ON classify_item.cid = ' + HOME_CLASSIFY_TABLE + '.id';
                    var sql = 'SELECT classify_item.*,' + HOME_CLASSIFY_TABLE + '.type,' + HOME_CLASSIFY_TABLE + '.title AS ctitle FROM (' + sql_classify + ') AS classify_item ' + left_classify;
                    connection.query(sql, function(err, result) {
                        if (!err) {
                            data.items = result;
                        }
                        callback(err, data)
                        connection.release();
                    });
                }
            });
        });
    },
    queryAdminClassifyItem(id, callback) {
        var sql = 'SELECT * ,  UNIX_TIMESTAMP(update_time) AS time FROM ' + HOME_CLASSIFY_ITEM_TABLE + ' WHERE id = ? AND del = 0 ORDER BY id DESC';
        pool.getConnection(function(err, connection) {
            connection.query(sql, [id], function(err, result) {
                callback(err, result)
                connection.release();
            });
        });
    },
    upClassifyItem(id, title, brief, logo, cid, callback) {
        var time = utils.getDateTime();
        var sql = 'UPDATE ' + HOME_CLASSIFY_ITEM_TABLE + ' SET title = ? ,brief = ? , logo = ? , cid = ? ,update_time = ? , state = 0 WHERE id = ? ';
        pool.getConnection(function(err, connection) {
            connection.query(sql, [title, brief, logo, cid, time, id], function(err, result) {
                callback(err, result)
                connection.release();
            });
        });
    },
    updateItemState(id, state, callback) {
        var sql = 'UPDATE ' + HOME_CLASSIFY_ITEM_TABLE + ' SET state = ? WHERE id = ? ';
        pool.getConnection(function(err, connection) {
            connection.query(sql, [state, id], function(err, result) {
                callback(err, result)
                connection.release();
            });
        });
    },
    delItemClassify(id, callback) {
        var sql = 'UPDATE ' + HOME_CLASSIFY_ITEM_TABLE + ' SET del = 1 WHERE id = ? ';
        pool.getConnection(function(err, connection) {
            connection.query(sql, [id], function(err, result) {
                callback(err, result)
                connection.release();
            });
        });
    },
    queryClassifyFromCid(cid, callback) {
        var sql = 'SELECT * ,  UNIX_TIMESTAMP(update_time) AS time FROM ' + HOME_CLASSIFY_ITEM_TABLE + ' WHERE cid = ? AND state = 1 AND del = 0 ORDER BY id DESC';
        pool.getConnection(function(err, connection) {
            connection.query(sql, cid, function(err, result) {
                callback(err, result)
                connection.release();
            });
        });
    },
    queryClassifyFromId(id, callback) {
        var sql = 'SELECT * ,  UNIX_TIMESTAMP(update_time) AS time FROM ' + HOME_CLASSIFY_ITEM_TABLE + ' WHERE id = ? AND state = 1 AND del = 0 ORDER BY id DESC';
        pool.getConnection(function(err, connection) {
            connection.query(sql, id, function(err, result) {
                callback(err, result)
                connection.release();
            });
        });
    },
}