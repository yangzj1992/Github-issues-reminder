var cli = require("commander");
var request = require("request");
// var config = require('./mail.js');
var config = require('./mailconfig.js');
var nodemailer = require('nodemailer');
var smtpTransport = nodemailer.createTransport('smtps://'+config.mail.from.auth.user+':'+config.mail.from.auth.pass+'@smtp.'+config.mail.from.service+'.com');
var options = {
  url: "https://api.github.com/repos/xitu/gold-miner/issues",
  headers: {
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:13.0) Gecko/20100101 Firefox/13.0',
  }
};
var getissue = function(){
    return new Promise(function (resolve, reject){
        request(options,  function(err, httpResponse, body) {
            if (err){
                reject(err);
            } 
            resolve(body);
        });
    });
}; 


function sendMail(subject, html) {
    var mailOptions = {
        from: [config.mail.from.name, config.mail.from.auth.user].join(' '),
        to: config.mail.to.join(','),
        subject: subject,
        html: html
    };

    smtpTransport.sendMail(mailOptions, function(error, response){
        if (error) {
            console.log(error);
        } else {
            console.log('Message sent: ' + response.response);
        }
        smtpTransport.close();
    });
};


getissue().then(function(data){
    data =JSON.parse(data);
    var need_translate,need_proofreading;
    need_translate = data.filter(function(value,index) {
        for(var j in value.labels){
            return value.labels[j].name == '文章认领';
        }
    });
    need_proofreading = data.filter(function(value,index) {
        for(var j in value.labels){
            return value.labels[j].name == '校对认领';
        }
    });
    if (need_translate.length >0) {
        console.log(' ');
        console.log('————————————————————————————————————————————————翻译认领————————————————————————————————————————————————');
        var translate_list = need_translate.map(function(index, elem) {
            return ['题目:'+value.title+' 链接:'+value.html_url]
        })
        console.log(translate_list);
    }
    if (need_proofreading.length >0) {
        console.log(' ');
        console.log('————————————————————————————————————————————————校验认领————————————————————————————————————————————————');
        var proofreading_list = need_proofreading.map(function(value, index) {
            return ['题目:'+value.title+' 链接:'+value.html_url]
        })
        console.log(proofreading_list);
    }
});