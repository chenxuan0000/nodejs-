/**
 * @Author: chenxuan
 * @Date:   2017-05-27T23:15:11+08:00
 * @Project: 自定义
 * @Filename: util.js
 * @Last modified by:   chenxuan
 * @Last modified time: 2017-06-01T13:44:41+08:00
 */


'use strict';
const xml2js = require('xml2js');
const temp = require('./temp');
const Promise = require('bluebird');

exports.parseXMLAsync = function(xml) {
  return new Promise(function(resolve, reject) {
    xml2js.parseString(xml, {
      trim: true
    }, function(err, content) {
      if (err) {
        reject(err);
      } else {
        resolve(content);
      }
    })
  })
}

function formatMessage(result){
    var message = {};
    if(typeof result === 'object'){
        var keys = Object.keys(result);
        for(var i=0;i<keys.length;i++){
            var key = keys[i];
            var item = result[key];
            if(!(item instanceof Array) || item.length === 0) continue;
            if (item.length === 1){
                var val = item[0];
                if (typeof val === 'object') message[key] = formatMessage(val);
                else message[key] = (val || '').trim();
            }else{
                message[key] = [];
                for(var j=0,k=item.length;j<k;j++) message[key].push(formatMessage(item[j]));
            }
        }
    }
    return message;
}
exports.formatMessage = formatMessage;
exports.temp = function(content = "暂不支持此格式回复", message) {
  var info = {};
  var type = 'text';
  if (Array.isArray(content)) {
    type = 'news';
  }
  type = content.type || type;
  info.content = content;
  info.createTime = (new Date()).getTime();
  info.msgType = type;
  info.toUserName = message.FromUserName;
  info.fromUserName = message.ToUserName; //这里有个问题特别注意。。。这个message.ToUserName在上面缓存并娶不到
  return temp.compiled(info);
}
