var express = require('express');
var router = express.Router();
var fs = require('fs');
var crypto = require('crypto');
// var gm = require('gm').subClass({ imageMagick: true });
var qiniuconfig = require('../conf/qiniuconfig');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var utils = require('./utils');

var qiniuconfDao = require('../daos/dbDaos').qiniuconfDao;

var qiniu = require('qiniu');

var config = new qiniu.conf.Config();
// 空间对应的机房
config.zone = qiniu.zone.Zone_z2;

var expires_in = 7200;

var mac = new qiniu.auth.digest.Mac(qiniuconfig.accessKey, qiniuconfig.secretKey);
var options = {
    scope: qiniuconfig.bucket,
    expires: expires_in,
};

var putPolicy = new qiniu.rs.PutPolicy(options);

var qn = require('qn');

var client = qn.create({
    accessKey: qiniuconfig.accessKey,
    secretKey: qiniuconfig.secretKey,
    bucket: qiniuconfig.bucket,
    origin: 'https://wx.91niang.com',
    uploadURL:'http://up-z2.qiniup.com'
});


module.exports = {
    uploadFile(inputFile,callback){
        var file_name = Date.now()+'_'+inputFile.originalFilename;
        var file_md5_name = crypto.createHash('md5').update(file_name).digest('hex');
        var uploadedPath = inputFile.path;
            client.uploadFile(uploadedPath, {
              key: 'songbei/picture/'+file_md5_name
            }, function (err, results) {
              // if (err) throw err;
              // console.log('------results')
              // console.log(results)
              if(err){
                    callback(err,null);
                    return;
              }
                // console.log(results.url)
                // gm(uploadedPath).size(function(err,size){
                //     // console.log('---size')
                //     // console.log(size)
                //     if(err){
                //         callback(err,null);
                //         return;
                //     }
                //     var data = {
                //         url:results.url,
                //         width:size.width,
                //         height:size.height
                //     }
                //     callback(null,data);
                // });
                var data = {
                    url:results.url,
                }
                callback(null,data);
            });
    },
    uploadPath(path, callback) {
        try {
            var index_str = 'yuce_temp_file/';
            if (path.lastIndexOf(index_str) == -1) {
                callback('路径错误:' + path, null)
                return;
            }
            var name = path.substring(path.lastIndexOf(index_str) + index_str.length, path.length);
            console.log('-----uploadPath')
            console.log(name);
            console.log(qiniuconfig.minis_yuce)
            var key = qiniuconfig.minis_yuce + name;
            var formUploader = new qiniu.form_up.FormUploader(config);
            var putExtra = new qiniu.form_up.PutExtra();
            // var readableStream = fs.createReadStream(path); // 可读的流
            //读取文件发生错误事件
            // readableStream.on('error', (err) => {
            //     console.log('发生异常:', err);
            // });
            // //已打开要读取的文件事件
            // readableStream.on('open', (fd) => {
            //     console.log('文件已打开:', fd);
            // });
            // //文件已经就位，可用于读取事件
            // readableStream.on('ready', () => {
            //     console.log('文件已准备好..');
            // });

            // //文件读取中事件·····
            // readableStream.on('data', (chunk) => {
            //     console.log('读取文件数据:', chunk);
            //     console.log(chunk.length)
            // });

            // //文件读取完成事件
            // readableStream.on('end', () => {
            //     console.log('读取已完成..');
            // });

            // //文件已关闭事件
            // readableStream.on('close', () => {
            //     console.log('文件已关闭！');
            // });
            var localFile = path;
            // console.log('path:',path)
            // console.log(readableStream);
            qiniuconfDao.queryQiniuToken(qiniuconfig.accessKey, function(err, result) {
                if (err) {
                    callback(err, null);
                } else {
                    var uploadToken = ''
                    if (result.length > 0) {
                        var qiniu_token = result[0].qiniu_token;
                        var qiniu_token_uptime = result[0].update_time;
                        var time = utils.getTime();
                        if (time - qiniu_token_uptime > expires_in) {
                            uploadToken = putPolicy.uploadToken(mac);
                            console.log('tag1');
                            qiniuconfDao.addQiniuToken(qiniuconfig.accessKey, uploadToken, expires_in, function(err, result) {
                                if (err) {
                                    callback(err, null);
                                }
                                formUploader.putFile(uploadToken, key, localFile, putExtra, function(respErr,
                                    respBody, respInfo) {
                                    if (respErr) {
                                        throw respErr;
                                    }
                                    if (respInfo.statusCode == 200) {
                                        // console.log(respBody);
                                        callback(null, { url: 'https://wx.91niang.com' + '/' + respBody.key })
                                    } else {
                                        // console.log(respInfo.statusCode);
                                        // console.log(respBody);
                                        callback(respBody, null);
                                    }
                                });
                            });
                        } else {
                            uploadToken = qiniu_token;
                            console.log('tag2');
                            formUploader.putFile(uploadToken, key, localFile, putExtra, function(respErr,
                                respBody, respInfo) {
                                if (respErr) {
                                    throw respErr;
                                }
                                if (respInfo.statusCode == 200) {
                                    // console.log(respBody);
                                    callback(null, { url: 'https://wx.91niang.com' + '/' + respBody.key })
                                } else {
                                    // console.log(respInfo.statusCode);
                                    // console.log(respBody);
                                    callback(respBody, null);
                                }
                            });
                        }
                    } else {
                        uploadToken = putPolicy.uploadToken(mac);
                        console.log('tag3');
                        qiniuconfDao.addQiniuToken(qiniuconfig.accessKey, uploadToken, expires_in, function(err, result) {
                            if (err) {
                                callback(err, null);
                            } else {
                                formUploader.putFile(uploadToken, key, localFile, putExtra, function(respErr,
                                    respBody, respInfo) {
                                    if (respErr) {
                                        throw respErr;
                                    }
                                    if (respInfo.statusCode == 200) {
                                        // console.log(respBody);
                                        callback(null, { url: 'https://wx.91niang.com' + '/' + respBody.key })
                                    } else {
                                        // console.log(respInfo.statusCode);
                                        // console.log(respBody);
                                        callback(respBody, null);
                                    }
                                });
                            }
                        });
                    }
                }
            });


        } catch (err) {
            callback(err, null);
        }
    },
    uploadStream(name, stream, callback) {
        try {
            // console.log(name);
            var key = qiniuconfig.wxminicode + name;
            var formUploader = new qiniu.form_up.FormUploader(config);
            var putExtra = new qiniu.form_up.PutExtra();
            console.log('------stream')
            console.log(stream)
            qiniuconfDao.queryQiniuToken(qiniuconfig.accessKey, function(err, result) {
                if (err) {
                    callback(err, null);
                } else {
                    var uploadToken = ''
                    if (result.length > 0) {
                        var qiniu_token = result[0].qiniu_token;
                        var qiniu_token_uptime = result[0].update_time;
                        var time = utils.getTime();
                        if (time - qiniu_token_uptime > expires_in) {
                            uploadToken = putPolicy.uploadToken(mac);
                            console.log('tag1');
                            qiniuconfDao.addQiniuToken(qiniuconfig.accessKey, uploadToken, expires_in, function(err, result) {
                                if (err) {
                                    callback(err, null);
                                }
                                formUploader.putStream(uploadToken, key, stream, putExtra, function(respErr,
                                    respBody, respInfo) {
                                    if (respErr) {
                                        throw respErr;
                                    }
                                    if (respInfo.statusCode == 200) {
                                        // https://wx.91niang.com/play_book/images//0627.jpg
                                        // { hash: 'FqnGmsVAad6rnk_F03zsBpvErwYX',
                                        // key: 'play_book/images//0627.jpg' }
                                        // console.log(respBody);
                                        callback(null, { url: 'https://wx.91niang.com' + '/' + respBody.key })
                                    } else {
                                        // console.log(respInfo.statusCode);
                                        // console.log(respBody);
                                        callback(respBody, null);
                                    }
                                });

                            });
                        } else {
                            uploadToken = qiniu_token;
                            console.log('tag2');
                            formUploader.putStream(uploadToken, key, stream, putExtra, function(respErr,
                                respBody, respInfo) {
                                if (respErr) {
                                    throw respErr;
                                }
                                if (respInfo.statusCode == 200) {
                                    // https://wx.91niang.com/play_book/images//0627.jpg
                                    // { hash: 'FqnGmsVAad6rnk_F03zsBpvErwYX',
                                    // key: 'play_book/images//0627.jpg' }
                                    // console.log(respBody);
                                    callback(null, { url: 'https://wx.91niang.com' + '/' + respBody.key })
                                } else {
                                    // console.log(respInfo.statusCode);
                                    // console.log(respBody);
                                    callback(respBody, null);
                                }
                            });
                        }
                    } else {
                        uploadToken = putPolicy.uploadToken(mac);
                        console.log('tag3');
                        qiniuconfDao.addQiniuToken(qiniuconfig.accessKey, uploadToken, expires_in, function(err, result) {
                            if (err) {
                                callback(err, null);
                            } else {
                                formUploader.putStream(uploadToken, key, stream, putExtra, function(respErr,
                                    respBody, respInfo) {
                                    if (respErr) {
                                        throw respErr;
                                    }
                                    if (respInfo.statusCode == 200) {
                                        // https://wx.91niang.com/play_book/images//0627.jpg
                                        // { hash: 'FqnGmsVAad6rnk_F03zsBpvErwYX',
                                        // key: 'play_book/images//0627.jpg' }
                                        // console.log(respBody);
                                        callback(null, { url: 'https://wx.91niang.com' + '/' + respBody.key })
                                    } else {
                                        // console.log(respInfo.statusCode);
                                        // console.log(respBody);
                                        callback(respBody, null);
                                    }
                                });
                            }
                        });
                    }
                }
            });


        } catch (err) {
            callback(err, null);
        }
    },
    uploadChats(name, chats, callback) {
        try {
            // console.log(name);
            var key = qiniuconfig.wxminicode + name;
            var formUploader = new qiniu.form_up.FormUploader(config);
            var putExtra = new qiniu.form_up.PutExtra();
            console.log('------chats')
            console.log(chats)
            qiniuconfDao.queryQiniuToken(qiniuconfig.accessKey, function(err, result) {
                if (err) {
                    callback(err, null);
                } else {
                    var uploadToken = ''
                    if (result.length > 0) {
                        var qiniu_token = result[0].qiniu_token;
                        var qiniu_token_uptime = result[0].update_time;
                        var time = utils.getTime();
                        if (time - qiniu_token_uptime > expires_in) {
                            uploadToken = putPolicy.uploadToken(mac);
                            console.log('tag1');
                            qiniuconfDao.addQiniuToken(qiniuconfig.accessKey, uploadToken, expires_in, function(err, result) {
                                if (err) {
                                    callback(err, null);
                                }
                                formUploader.put(uploadToken, key, chats, putExtra, function(respErr,
                                    respBody, respInfo) {
                                    if (respErr) {
                                        throw respErr;
                                    }
                                    if (respInfo.statusCode == 200) {
                                        // https://wx.91niang.com/play_book/images//0627.jpg
                                        // { hash: 'FqnGmsVAad6rnk_F03zsBpvErwYX',
                                        // key: 'play_book/images//0627.jpg' }
                                        // console.log(respBody);
                                        callback(null, { url: 'https://wx.91niang.com' + '/' + respBody.key })
                                    } else {
                                        // console.log(respInfo.statusCode);
                                        // console.log(respBody);
                                        callback(respBody, null);
                                    }
                                });

                            });
                        } else {
                            uploadToken = qiniu_token;
                            console.log('tag2');
                            formUploader.put(uploadToken, key, chats, putExtra, function(respErr,
                                respBody, respInfo) {
                                if (respErr) {
                                    throw respErr;
                                }
                                if (respInfo.statusCode == 200) {
                                    // https://wx.91niang.com/play_book/images//0627.jpg
                                    // { hash: 'FqnGmsVAad6rnk_F03zsBpvErwYX',
                                    // key: 'play_book/images//0627.jpg' }
                                    // console.log(respBody);
                                    callback(null, { url: 'https://wx.91niang.com' + '/' + respBody.key })
                                } else {
                                    // console.log(respInfo.statusCode);
                                    // console.log(respBody);
                                    callback(respBody, null);
                                }
                            });
                        }
                    } else {
                        uploadToken = putPolicy.uploadToken(mac);
                        console.log('tag3');
                        qiniuconfDao.addQiniuToken(qiniuconfig.accessKey, uploadToken, expires_in, function(err, result) {
                            if (err) {
                                callback(err, null);
                            } else {
                                formUploader.put(uploadToken, key, chats, putExtra, function(respErr,
                                    respBody, respInfo) {
                                    if (respErr) {
                                        throw respErr;
                                    }
                                    if (respInfo.statusCode == 200) {
                                        // https://wx.91niang.com/play_book/images//0627.jpg
                                        // { hash: 'FqnGmsVAad6rnk_F03zsBpvErwYX',
                                        // key: 'play_book/images//0627.jpg' }
                                        // console.log(respBody);
                                        callback(null, { url: 'https://wx.91niang.com' + '/' + respBody.key })
                                    } else {
                                        // console.log(respInfo.statusCode);
                                        // console.log(respBody);
                                        callback(respBody, null);
                                    }
                                });
                            }
                        });
                    }
                }
            });


        } catch (err) {
            callback(err, null);
        }
    },
    uploadeStream(formUploader, uploadToken, key, readableStream, putExtra, callback) {
        formUploader.putStream(uploadToken, key, readableStream, putExtra, function(respErr,
            respBody, respInfo) {
            if (respErr) {
                throw respErr;
            }
            if (respInfo.statusCode == 200) {
                // https://wx.91niang.com/play_book/images//0627.jpg
                // { hash: 'FqnGmsVAad6rnk_F03zsBpvErwYX',
                // key: 'play_book/images//0627.jpg' }
                // console.log(respBody);
                callback(null, { url: 'https://wx.91niang.com' + '/' + respBody.key })
            } else {
                // console.log(respInfo.statusCode);
                // console.log(respBody);
                callback(respBody, null);
            }
        });
    }
};