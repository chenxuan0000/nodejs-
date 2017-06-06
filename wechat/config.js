/**
 * @Author: chenxuan
 * @Date:   2017-05-28T22:45:33+08:00
 * @Project: 自定义
 * @Filename: config.js
 * @Last modified by:   chenxuan
 * @Last modified time: 2017-06-06T20:09:34+08:00
 */

'use strict';
const path = require('path');
const util = require('./libs/util');
var wechat_file = path.join(__dirname, './config/wechat_file.txt');
var config = {
  wechat: {
    appID: "",
    appSecret: "",
    token: "",
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
