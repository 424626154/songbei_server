var crypto = require('crypto');
var server = require('../conf/config').server;
var moment = require('moment');
module.exports = {
	getCode:function(){
		var code=''; 
		for(var i=0;i<4;i++) 
		{ 
		  code+=Math.floor(Math.random()*10); 
		} 
		return  code;
	},
	getTime:function(){
		var time = parseInt(Date.now()/1000)
		return time;
	},
	getDateTime() {
        return moment().format('YYYY-MM-DD HH:mm:ss');
    },
	getOnDayTime:function(){
		var start = new Date(
		new Date(new Date().toLocaleDateString()).getTime()
		); // 当天0点
		var ondat_time = parseInt(start/1000)
		return ondat_time;
	},
	getOnDayEndTime:function(){
		var end = new Date( // 当天23:59
		new Date(new Date().toLocaleDateString()).getTime() +
		24 * 60 * 60 * 1000 -
		1
		);
		var ondat_end_time = parseInt(end/1000)
		return ondat_end_time;
	},
	get30DayTime:function(){
		var start = new Date(
		new Date(new Date().toLocaleDateString()).getTime()
		- 30 * 24 * 60 * 60 * 1000
		); 
		var ondat_time = parseInt(start/1000)
		return ondat_time;
	},
	getUserid:function(phone){
		var userid = 'userid_'+phone;
		return userid;
	},
	/**
	 * 随机数
	 */
	getNonce:function(length){
		var nonce=''; 
		for(var i=0;i<length;i++) 
		{ 
		  nonce+=Math.floor(Math.random()*10); 
		} 
		return  nonce;
	},
	/**
	 * 当前UTC时间戳，从1970年1月1日0点0 分0 秒开始到现在的秒数(String)
	 */
	getCurTimeStr:function(){
		var time = parseInt(Date.now()/1000)
		return time+'';
	},
	/**
	 * 计算CheckSum
	 * @param  {String} appSecret 网易生成
	 * @param  {String} nonce     随机数（最大长度128个字符）
	 * @param  {String} curTime   当前UTC时间戳，从1970年1月1日0点0 分0 秒开始到现在的秒数(String)
	 * @return {[type]}                  [description]
	 */
	getCheckSum:function(appSecret ,nonce, curTime) {
        // return encode("sha1", appSecret + nonce + curTime);
		var str = appSecret + nonce + curTime;
		var sha1 = crypto.createHash("sha1");//定义加密方式:md5不可逆,此处的md5可以换成任意hash加密的方法名称；
	    sha1.update(str);
	    var checkSum = sha1.digest("hex");  //加密后的值d
	    // console.log('appSecret:'+appSecret+'\nnonce:'+nonce+'\ncurTime:'+curTime);
	    // console.log('checkSum:'+checkSum)
	    return checkSum;
    },
    /**
     * 判断是否为手机号  
     */
	 isPoneAvailable:function(pone){  
	   var myreg = /^[1][3,4,5,7,8][0-9]{9}$/;  
	   if (!myreg.test(pone)) {  
	     return false;  
	   } else {  
	     return true;  
	   }  
	 },
	 isJsName:function(temp_jsname){
	 	console.log(temp_jsname)
	 	var jsname = 'default';
	 	var isfull = false;
 		if(isfull){
 			jsname = temp_jsname;
 		}else{
 			var strarr = temp_jsname.split('/');
	 		if(strarr.length > 0 ){
	 			jsname = strarr[strarr.length-1];
	 		}else{
	 			jsname = temp_jsname;
	 		}
 		}
	 	return jsname;
	 },
	 /**
	  * 校验手机号
	  */
	 checkPhone:function(phone){
		 // let isphone = (/^1(3|4|5|7|8)\d{9}$/.test(phone));   
		 // return isphone
		 //暂时未校验
		 console.log('------checkPhone');
		 console.log(phone);
		 return true;
	 },
	 fromCountryCode:function(country_code,phone){
	 	var new_phone = phone;
	 	if(country_code.length > 0&&country_code != '86'){
	 		new_phone = country_code+phone;
	 	}
	 	console.log(new_phone);
	 	return new_phone;
	 },
	 getEcosystem:function(){
		var ip = 'http://localhost:9422';
		if(server.env == server.ali){
			ip = 'http://ecos.zanzhe580.com';
		}
		return ip;
	},
	getRNum:function(n, m){
        var random = Math.floor(Math.random()*(m-n+1)+n);
        return random;
    },
    getPushTitle(title){
    	var push_title = title;
    	if(title.length > 10){
    		push_title = title.substring(0,7)+'...'
    	}
    	return push_title;
    }
}