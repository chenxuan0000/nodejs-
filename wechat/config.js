/**
 * @Author: chenxuan
 * @Date:   2017-05-28T22:45:33+08:00
 * @Project: 自定义
 * @Filename: config.js
 * @Last modified by:   chenxuan
 * @Last modified time: 2017-06-01T15:25:58+08:00
 */

'use strict';
const path = require('path');
const util = require('./libs/util');
var wechat_file = path.join(__dirname, './config/wechat_file.txt');
var config = {
  wechat: {
    appID: "wx835a27791573bbb8",
    appSecret: "0586510c02305208e339d6b03df4cfc6",
    token: "chenxuan19930316",
    getAccessToken: function() {
      return util.readFileAsync(wechat_file);
    },
    saveAccessToken: function(data) {
      var data = JSON.stringify(data);
      return util.writeFileAsync(wechat_file, data);
    }
  }
};

module.exports = config;
