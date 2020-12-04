var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var ejs = require('ejs');
var moment = require('moment');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var userRouter = require('./routes/user');
var qiniuRouter = require('./routes/qiniu');
var discussRouter = require('./routes/discuss');
var starRouter = require('./routes/star');
var loveRouter = require('./routes/love');
var commentRouter = require('./routes/comment');
var messageRouter = require('./routes/message');
var chatRouter = require('./routes/chat');
var homeRouter = require('./routes/home');
var secondhandRouter = require('./routes/secondhand');
var datingRouter = require('./routes/dating');
var adminRouter = require('./routes/admin');
var adminHomeRouter = require('./routes/admin_home');
var adminClassifyRouter = require('./routes/admin_classify');
var apph5Router = require('./routes/apph5');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'ejs');
app.engine('.html', ejs.__express);
app.set('view engine', 'html');

app.locals.moment = moment;

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/user', userRouter);
app.use('/qiniu', qiniuRouter);
app.use('/discuss', discussRouter);
app.use('/star', starRouter);
app.use('/love', loveRouter);
app.use('/comment', commentRouter);
app.use('/message', messageRouter);
app.use('/chat', chatRouter);
app.use('/home', homeRouter);
app.use('/secondhand', secondhandRouter);
app.use('/dating', datingRouter);
app.use('/admin', adminRouter);
app.use('/admin/home', adminHomeRouter);
app.use('/admin/classify', adminClassifyRouter);
app.use('/apph5', apph5Router);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
