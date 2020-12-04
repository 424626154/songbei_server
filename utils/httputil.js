var logger = require('./log4jsutil').logger(__dirname+'/httputil.js');
var http = require('http');
var request = require('request');

var server_conf = require('../conf/config').server;
var http_post = server_conf.http_post;

module.exports = {
	/**
	 * 请求服务器
	 */
	requstLocalPost:function(path,data,callback){
	    data = JSON.stringify(data);  
	    console.log('---requstLocalPost path:'+path+' data:'+data);  
	    var opt = {  
	        method: "POST",  
	        host: 'localhost',  
	        port: http_post,  
	        path: path,  
	        headers: {  
	            "Content-Type": 'application/json;charset=utf-8',  
	            "Content-Length": Buffer.byteLength(data,'utf-8'),//data.length,
	        },
	    }; 
	    var req = http.request(opt, function (server) {  
	        if (server.statusCode == 200) {  
	            var body = "";  
	            server
	            .on('data', function (data) { 
	            	body += data; 
	            })  
	                          
	            .on('end', function () { 
	             	var result = JSON.parse(body);
	             	console.log('---response requstPSPost path:'+path+' result:'+body);
	             	if(result.code == 0){
	             		callback(null,result.data);   
	             	}else{
	             		callback(new Error(JSON.stringify(result)),null)  
	             	}     
	            });  
	        }  
	        else {  
	        	console.log('---response requstPSPost path:'+path+' err:'+server.statusCode);
	            callback(new Error(server.statusCode),null);   
	        }  
	    });  
	    req.write(data + "\n");  
	    req.end();  
	},
	sendAliSms:function(phone,code,callback){
		var data = {  
	       phone:phone,
	       code:code,
	    };  
	    data = JSON.stringify(data);  
	    logger.debug(data);  
	    var opt = {  
	        method: "POST",  
	        host: 'localhost',  
	        port: 9001,  
	        path: "/ali/sendcode",  
	        headers: {  
	            "Content-Type": 'application/json;charset=utf-8',  
	            "Content-Length": data.length,
	        },
	    }; 
	    var req = http.request(opt, function (serverAli) {  
	        if (serverAli.statusCode == 200) {  
	            var body = "";  
	            serverAli
	            .on('data', function (data) { 
	            	body += data; 
	            })  
	                          
	            .on('end', function () { 
	             	// res.send(200, body); 
	             	// console.log('请求sms')
	             	var json_data = JSON.parse(body);
	             	if(json_data.code == 0){
	             		callback(null,json_data.data);   
	             	}else{
	             		callback(body,null)  
	             	}     
	            });  
	        }  
	        else {  
	            // res.send(500, "error");  
	            callback(new Error(serverAli.statusCode),null);   
	        }  
	    });  
	    req.write(data + "\n");  
	    req.end();  
	},
	requstUrl:function(url,callback){
		request(url, function (error, response, body) {
		  if (error) {
		  	callback(error,null)
		  }else{
		  	if(response.statusCode == 200){
		  		callback(null,body)
		  	}else{
		  		callback(new Error(response.statusCode),null)
		  	}
		  }
		})
	},
	requstAppPost:function(path,data,callback){
	    data = JSON.stringify(data);  
	    console.log('---requstLocalPost path:'+path+' data:'+data);  
	    var opt = {  
	        method: "POST",  
	        host: 'localhost',  
	        port: 9001,  
	        path: path,  
	        headers: {  
	            "Content-Type": 'application/json;charset=utf-8',  
	            "Content-Length": Buffer.byteLength(data,'utf-8'),//data.length,
	        },
	    }; 
	    var req = http.request(opt, function (server) {  
	        if (server.statusCode == 200) {  
	            var body = "";  
	            server
	            .on('data', function (data) { 
	            	body += data; 
	            })  
	                          
	            .on('end', function () { 
	             	var result = JSON.parse(body);
	             	console.log('---response requstPSPost path:'+path+' result:'+body);
	             	if(result.code == 0){
	             		callback(null,result.data);   
	             	}else{
	             		callback(new Error(JSON.stringify(result)),null)  
	             	}     
	            });  
	        }  
	        else {  
	        	console.log('---response requstPSPost path:'+path+' err:'+server.statusCode);
	            callback(new Error(server.statusCode),null);   
	        }  
	    });  
	    req.write(data + "\n");  
	    req.end();  
	},
}