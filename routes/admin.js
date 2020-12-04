var _roomdir = "../";
var logger = require(_roomdir+'utils/log4jsutil').logger(__dirname + '/admin.js');
var express = require('express');
var router = express.Router();
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var qiniuutil = require(_roomdir+'utils/qiniuutil');
var ru = require(_roomdir+'utils/routersutil');

/******db*****/
var dbDao = require(_roomdir + 'daos/dbDaos');
var adminUserDao = dbDao.adminUserDao;
var feedbackDao = dbDao.feedbackDao;

/* GET home page. */
router.get('/', function(req, res, next) {
  var user = req.cookies.songbei_admin_user;
  if(!user){
  	res.redirect("/admin/login");
  	return ;
  }
  var op = req.query.op;
  if(op == 'logout'){
  	res.clearCookie('songbei_admin_user');
  	res.redirect("/admin/login");
  	return;
  }
  // res.render('ahome', { user: user });
  res.redirect("admin/home");
});

router.get('/login', function(req, res, next) {
  // console.log(req.cookies.user)
  res.render('admin/login',{err:''});
});

router.post('/login',multipartMiddleware, function(req, res, next) {
  console.log(req.body)
  var user = req.body.user;
  var password = req.body.password;
  var autologin = req.body.autologin;
  if(!user||!password){
    res.render('admin/login',{err:'参数错误'});
    return;
  }
  var maxAge = 10;
  if(autologin){
  	 maxAge = 1<<31 - 1;
  }
  adminUserDao.queryAdminUser(user,function(err,result){
      if(err){
        res.render('admin/login',{err:err});
      }else{
        console.log('------result');
        console.log(result)
        if(result.length > 0){
          var user = result[0];
          console.log(result)
          if(user.password == password){
              res.cookie('songbei_admin_user',user.account, {maxAge:maxAge});
              res.redirect("/admin");
          }else{
            res.render('admin/login',{err:'密码错误'});
          }
        }else{
          res.render('admin/login',{err:'用户名错误'});
        }
      }
  });
  // console.log(maxAge)
  // res.render('login');
});


router.post('/uploadfile', multipartMiddleware, function(req, res, next) {
    try {
        var inputFile = req.files.file;
        console.log('inputFile', inputFile)
        qiniuutil.uploadFile(inputFile, function(err, result) {
            if (err) {
                ru.resError(res, err);
            } else {
                ru.resSuccess(res, result);
            }
        });
    } catch (err) {
        ru.resError(res, err.message);
    }
});

router.get('/feedback', function(req, res, next) {
  var user = req.cookies.songbei_admin_user;
  if(!user){
    res.redirect("/login");
    return ;
  }
  var op = req.query.op;
  if(op == 'del'){
    var id = req.query.id;
    if(id){
      feedbackDao.delFeedback(id,function(err,result){
        if(err){
          res.render('admin/feedback', { user: user,err:err,objs:[]});
        }else{
          res.redirect('/admin/feedback');
          
        }
      })
    }
    return 
  }
  feedbackDao.queryFeedbacks(function(err,result){
    if(err){
      res.render('admin/feedback', { user: user,err:err,objs:[]});
    }else{
       res.render('admin/feedback', { user: user,err:'',objs:result});
    }
  });
});

module.exports = router;
