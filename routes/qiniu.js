var _roomdir = "../";
var logger = require(_roomdir+'utils/log4jsutil').logger(__dirname + '/qiniu.js');
var express = require('express');
var router = express.Router();
var ru = require(_roomdir+'utils/routersutil');
var qiniuconfig = require(_roomdir+'conf/qiniuconfig');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

var dbDaos = require(_roomdir+'daos/dbDaos');
var qiniuconfDao = dbDaos.qiniuconfDao;

// console.log(qiniuconfig)
// var qn = require('qn');

// var qn_client = qn.create({
// 	accessKey: qiniuconfig.accessKey,
//     secretKey: qiniuconfig.secretKey,
//     bucket: qiniuconfig.bucket,
//     origin: 'http://{bucket}.u.qiniudn.com',
// });

var qiniu = require('qiniu');
var mac = new qiniu.auth.digest.Mac(qiniuconfig.accessKey, qiniuconfig.secretKey);
console.log(mac)


// var options = {
//   scope: qiniuconfig.bucket,
//   returnBody: '{"key":"$(key)","hash":"$(etag)","fsize":$(fsize),"bucket":"$(bucket)","name":"$(x:name)"}',
//   expires: 7200,
//   callbackUrl: 'http://api.example.com/qiniu/upload/callback',
//   callbackBodyType: 'application/json'

// };
// 

var expires_in = qiniuconfig.expires_in;

var options = {
    scope: qiniuconfig.bucket,
    expires: expires_in,
};
var putPolicy = new qiniu.rs.PutPolicy(options);

// console.log(uploadToken)

router.get('/', function(req, res, next) {
    ru.logReq(req);
    res.send('qiniu');
});

router.post('/uptoken', function(req, res, next) {
    try {
        ru.logReq(req);
        qiniuconfDao.queryQiniuToken(qiniuconfig.accessKey,function(err, result) {
            if (err) {
                ru.resError(res, err);
                return;
            }
            if (result.lenght > 0) {
                var qiniu_token = result[0].qiniu_token;
                var qiniu_token_uptime = result[0].qiniu_token_uptime;
                var time = utils.getTime();
                if (time - qiniu_token_uptime > 7200) {
                    uploadToken = putPolicy.uploadToken(mac);
                    qiniuconfDao.addQiniuToken(qiniuconfig.accessKey,uploadToken,expires_in,function(err, result) {
                        if (err) {
                            logger.error(err);
                        }
                    });
                } else {
                    uploadToken = qiniu_token;
                }
            } else {
                uploadToken = putPolicy.uploadToken(mac);
                qiniuconfDao.addQiniuToken(qiniuconfig.accessKey,uploadToken,expires_in,function(err, result) {
                    if (err) {
                        logger.error(err);
                    }
                });
            }
            ru.resSuccess(res, uploadToken);
        });
    } catch (err) {
        ru.resError(res, err.message);
    }
});

module.exports = router;