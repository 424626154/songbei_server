const Core = require('@alicloud/pop-core');
var aliconf = require('../conf/aliconfig');

var client = new Core({
  accessKeyId: aliconf.accessKeyId,
  accessKeySecret: aliconf.accessSecret,
  endpoint: 'https://dysmsapi.aliyuncs.com',
  apiVersion: '2017-05-25'
});

console.log(aliconf.accessSecret)

module.exports = {
  sendAliSms:function(phone,code,callback){
    var params = {
      "PhoneNumbers": phone,
      "TemplateCode": aliconf.TemplateCode,
      "SignName": "Poem验证",
      "TemplateParam": "{\"code\":\""+code+"\"}"
    }

    var requestOption = {
      method: 'POST'
    };

    client.request('SendSms', params, requestOption).then((result) => {
      console.log(result);
      callback(null,result);
    }, (ex) => {
      console.log(ex);
      callback(ex,callback);
    })
  }
}
