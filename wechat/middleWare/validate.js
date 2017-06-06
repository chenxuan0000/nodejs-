/**
 * @Author: chenxuan
 * @Date:   2017-05-27T20:32:52+08:00
 * @Project: 验证中间件
 * @Filename: validate.js
 * @Last modified by:   chenxuan
 * @Last modified time: 2017-06-01T14:50:32+08:00
 */
'use strict';
const sha1 = require('sha1');
const getRawBody = require('raw-body');
const Promise = require('bluebird');
const Wechat = require('./wechat');
const util = require('./util');
var requset = Promise.promisify(require('request'));

module.exports = function(opts, handler) {
  //new 实例化管理票据逻辑处理
  var wechatApi = new Wechat(opts);
  return function*(next) {
    var token = opts.token;
    var that = this;
    // var signature = this.query.singature; //bug1 缓存无法获取未知bug
    var nonce = this.query.nonce;
    var timestamp = this.query.timestamp;
    var echostr = this.query.echostr;
    var str = [token, timestamp, nonce].sort().join('');
    var sha = sha1(str);
    // console.log(this.query);
    if (this.method === 'GET') {
      if (sha === this.query.signature) {
        this.body = echostr + '';
      } else {
        this.body = 'wrong';
      }
    } else if (this.method === 'POST') {
      if (sha !== this.query.signature) {
        this.body = 'wrong';
        return false;
      }

      var data = yield getRawBody(this.req, {
        length: this.length,
        limit: '1mb',
        encoding: this.charset
      });
      // console.log(data.toString());
      var content = yield util.parseXMLAsync(data);
      // console.log(content);
      var message = util.formatMessage(content.xml);
      //将请求的msg挂载到this.weixin供其他模块使用
      that.weixin = message;
      yield handler.call(that, next); //注意这个是weixin.reply的暂停回调
      wechatApi.reply.call(that);
    }
  }
}
