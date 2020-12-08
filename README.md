# songbei_server
松北生活圈-服务器


##服务器部署
1.克隆代码:git clone https://github.com/424626154/songbei_server.git
2.补充已忽略文件

conf/aliconfig.js
```
module.exports  = {
    accessKeyId: 'xxxxx',
    accessSecret: 'xxxxx',
    TemplateCode:'xxxxx',
};
```
conf/appconfig.js
```
module.exports = {
    APP_NAME:'songbei',
    APP_NAME_TEXT:'松北生活圈'
};
```
conf/config.js
```
var logger = require('../utils/log4jsutil').logger(__dirname+'/config.js');
var server = {
        sms:'',//短信 ali 阿里 jpush 极光
        push:true,//推送
        validate:true,//验证码
        mysqldb:'default',//'default' 默认 'docker'   阿里云'ali' 
        app_name:'songbei',
}
/**
 * http服务器
 */
server.http_post = xxxx;


server.debug = 'debug';
server.ali = 'ali';
server.tencent = 'tencent';

// server.env = server.debug;
// server.env = server.ali;
server.env = server.tencent;

if(server.env == server.ali){
    server.sms = 'ali';
    server.push = true;
    server.validate = true;
    server.mysqldb = 'ali';
}else if(server.env == server.tencent){  
    server.sms = 'ali';
    server.push = true;
    server.validate = true;
    server.mysqldb = 'tencent';  
}else{
    // server.sms = 'ali';
}

//配置项
module.exports = {
    server,
};
```
conf/db.js
```
module.exports = {
	 mysql: {
        host: 'xxxx',
        user: 'xxxx',
        password: 'xxxx',
        database:'xxxx',
        port: xxxx,
        multipleStatements:true,
    },
    ali_mysql: {
        host: 'xxxx',
        user: 'xxxx',
        password: '',
        database:'xxxx',
        port: xxxx,
        multipleStatements:true,
    },
    docker_mysql: {
        host: '',
        user: 'xxxx',
        password: 'xxxx',
        database:'xxxx',
        port: xxxx,
        multipleStatements:true,
    },
};
```
conf/deftext.js
```
var deftext = {

}
deftext.register_title = '欢迎来到[松北生活圈]!';
deftext.register_content = '感谢您的到来，希望[松北区生活圈]能给您的生活增添一份色彩，让我们共同努力打造一个纯净社区！';
module.exports  = deftext;
```
conf/qiniuconfig.js
```
module.exports  = {
    accessKey: 'xxxxxx',
    secretKey: 'xxxxxx',
    bucket:'xxxxxx',
    expires_in:7200,
};
```
conf/webhookconfig
```
module.exports = {
    URL:'xxxxxx',
};

```

firebase_json/xxxxx.json
firebase 消息推送的服务器json文件

3.安装node_modules
```
npm install
npm install xxxxxx
```
4.创建数据库
使用MySQL workbench创建数据库[songbei]
导入数据dumps/xxxx.sql
5.pm2启动 
```
pm2 start processes.json
```
查看日志
```
pm2 logs songbei
```
后台地址
http://xx.xx.xx.xx:9401/admin/home


