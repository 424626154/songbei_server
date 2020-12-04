var _roomdir = "../";
var logger = require(_roomdir+'utils/log4jsutil').logger(__dirname+'/love.js');
var express = require('express');
var router = express.Router();
var ru = require(_roomdir+'utils/routersutil');

/*---db---*/
var dbDao = require(_roomdir+'daos/dbDaos');
var loveDao = dbDao.loveDao;

/**
 * 点赞
 */
router.post('/love', function(req, res, next) {
    try{
      ru.logReq(req);
      var id = req.body.id;
      var type = req.body.type;
      var userid = req.body.userid;
      var love = req.body.love;
      if(!id||!userid||!type){
        ru.resError(res,'参数错误');
        return ;
      }
      loveDao.queryCount(id,type,function(err,count){
        if(err){
          ru.resError(res,err);
        }else{
          if(count > 0 ){
               loveDao.upLove(id,type,userid,love,function(err,love){    
              if(err){
                  ru.resError(res,err);
                }else{
                  ru.resSuccess(res,love);
                }
              });
          }else{
          ru.resError(res,'作品不存在或者已经被删除！');
          }
        }
      });
    }catch(err){
      ru.resError(res,err.message);
    }  
}); 
/**
 * 获取点赞列表
 */
router.post('/loves', function(req, res, next) {
  try{
      ru.logReq(req);
      var id = req.body.id;
      var type = req.body.type;
      if(!id||!type){
        ru.resError(res,'参数错误')
      }else{
        loveDao.queryLoves(id,type,function(err,result){
          if(err){
              ru.resError(res,err)
            }else{
              ru.resSuccess(res,result);
            }
        });
      }
  }catch(err){
      ru.resError(res,err.message);
  }
});

/**
 * 讨论点赞数和评论数
 */
router.post('/lcnum', function(req, res, next) {
  try{
      ru.logReq(req);
      var id = req.body.id;
      var type = req.body.type;
      if(!id||!type){
        ru.resError(res,'参数错误');
      }else{
        loveDao.queryLCNum(id,type,function(err,result){
            if(err){
            ru.resError(res,err);
            }else{
              var poem = {};
              if(result.length > 0 ){
                poem = result[0];
                ru.resSuccess(res,poem);
              }else{
                ru.resError(res,'作品ID失效');
              }
            }
          });
      }
  }catch(err){
      ru.resError(res,err.message);
  }
}); 

router.post('/lovecomment',function(req, res, next){
  ru.logReq(req);
    var iid = req.body.iid;
    var icid = req.body.icid
    var userid = req.body.userid;
    var love = req.body.love;
    var type = req.body.type;
    if(!iid||!icid||!userid||!type){
      ru.resError(res,'参数错误');
      return ;
    }
    loveDao.loveComment(iid,icid,userid,love,type,function(err,result){
      if(err){
        ru.resError(res,err);
      }else{
        // console.log('------loveComment')
        // console.log(result)
        if(love == 1){
          loveDao.addCommentLoveNum(icid,type,function(err,result){
              if(err)logger.error(err);
          });
        }else if(love == 0){
          loveDao.reduceCommentLoveNum(icid,type,function(err,result){
              if(err)logger.error(err);
          });
        }
        ru.resSuccess(res,{id:icid,love:love});
      }
    });
});


module.exports = router;
