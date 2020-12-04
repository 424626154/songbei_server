var logger = require('../utils/log4jsutil').logger(__dirname + '/webhook.js');
var http = require('http');
var request = require('request');
var https = require('https');
var webhookconfig = require('../conf/webhookconfig');


module.exports = {
    senMsg(body, callback) {
        let options = {
            url: webhookconfig.URL,
            method: "POST",
            body: body,
            json: true,
            headers: {
                'Content-Type': 'application/json; charset=UTF-8'
            }
        }
        request(options, function(err, response, body) {
            if (!err && response.statusCode == 200) {
                callback(null, body)
            } else {
                callback(err, null)
            }
        });
    },
    sendTextMsg(content,callback) {
        var body = {
            "msgtype": "text",
            "text": {
                "content": content,
                "mentioned_mobile_list":["13671172337"]
            }
        };
        var body_str = JSON.stringify(body);
        this.senMsg(body,callback);
    },
    sendMarkdownMsg(content,callback) {
        var body = {
            "msgtype": "markdown",
            "markdown": {
                "content": content,
                "mentioned_mobile_list":["13671172337"]
            }
        };
        var body_str = JSON.stringify(body);
        this.senMsg(body,callback);
    }
}