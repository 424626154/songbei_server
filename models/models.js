/**
 * 模块定义类
 */

var LoveExtend = function(title,userid,head,nickname,pid){
	this.title = title||'';
	this.userid = userid||'';
	this.head = head||'';
	this.nickname = nickname||'';
	this.pid = pid||'';
}
var CommentExtend = function(title,userid,head,nickname,pid,cid,comment){
	this.title = title||'';
	this.userid = userid||'';
	this.head = head||'';
	this.nickname = nickname||'';
	this.pid = pid||'';
	this.cid = cid||'';
	this.comment = comment||'';
}
var FollowExtend = function(userid,head,nickname){
	this.userid = userid||'';
	this.head = head||'';
	this.nickname = nickname||'';
}
/**
 * 删除作品
 */
var DelPoemExtend = function(pid){
	this.pid = pid||'';
}

var AddPoemExtend = function(pid,userid,head,nickname,title){
	this.pid = pid||0;
	this.userid = userid||'';
	this.head = head||'';
	this.nickname = nickname||'';
	this.title = title||'';
}
/**
 * 徽章推送扩展
 * @param {[type]} pid       [description]
 * @param {[type]} userid    [description]
 * @param {[type]} head      [description]
 * @param {[type]} nickname [description]
 * @param {[type]} title     [description]
 */
var BadgeExtend = function(classify,type,title){
	this.classify = classify||0;
	this.type = type||'';
	this.title = title||'';
}

var Message = function(type,userid,title,content,extend){
	this.type = type||0;
	this.userid = userid||'';
	this.title = title||'';
	this.content = content||'';
	this.extend = extend||{};
}

// 添加讨论
var AddDiscussExtend = function(id,userid,head,nickname,title){
	this.id = id||0;
	this.userid = userid||'';
	this.head = head||'';
	this.nickname = nickname||'';
	this.title = title||'';
}

/**
 * 删除讨论
 */
var DelDiscussExtend = function(id){
	this.id = id||'';
}


var DLoveExtend = function(title,userid,head,nickname,id){
	this.title = title||'';
	this.userid = userid||'';
	this.head = head||'';
	this.nickname = nickname||'';
	this.id = id||'';
}
var DCommentExtend = function(title,userid,head,nickname,id,cid,comment){
	this.title = title||'';
	this.userid = userid||'';
	this.head = head||'';
	this.nickname = nickname||'';
	this.id = id||'';
	this.cid = cid||'';
	this.comment = comment||'';
}


var MessageType = function(){

}
MessageType.SYS_MSG = 0;//系统消息
MessageType.LOVE_MSG = 1;//点赞
MessageType.COMMENT_MSG = 2;//评论
MessageType.FOLLOW_MSG = 3;//关注
MessageType.DELPOEM_MSG = 4;//作品违规被删除
MessageType.ADD_POEM_MSG = 5;//发布作品
MessageType.DADD = 6;//添加讨论
MessageType.DLOVE = 7;//点赞讨论
MessageType.DCOMMENT = 8;//评论讨论
MessageType.BAGDE = 9;//徽章
var PushType = function(){

}
PushType.NEWS = 'news';
PushType.CHAT = 'chat';

/**
 * 徽章
 * @type {Object}
 */
var BadgeModule = function(badge){
	this.id = badge&&badge.id?badge.id:0
	this.classify = 1
	this.ctitle = badge&&badge.ctitle?badge.ctitle:''
	this.type = badge&&badge.type?badge.type:0
	this.title = badge&&badge.title?badge.title:''
	this.condition = badge&&badge.condition?badge.condition:'' //条件描述
	this.ceiling = badge&&badge.ceiling?badge.ceiling:0 //完成上限
	this.need = badge&&badge.need?badge.need:1 //单次达成的条件次数
	this.complete = 0 //完成次数
	this.comnum = 0//完成人数
	this.comtime = 0 //完成日期
}


module.exports = {
	LoveExtend,
	CommentExtend,
	FollowExtend,
	DelPoemExtend,
	AddPoemExtend,
	AddDiscussExtend,
	DelDiscussExtend,
	DLoveExtend,
	DCommentExtend,
	Message,
	MessageType,
	PushType,
	BadgeModule,
	BadgeExtend,
};