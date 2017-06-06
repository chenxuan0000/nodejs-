/**
 * @Author: chenxuan
 * @Date:   2017-05-27T19:15:17+08:00
 * @Project: 入口文件
 * @Filename: app.js
 * @Last modified by:   chenxuan
 * @Last modified time: 2017-06-01T14:50:33+08:00
 */
'use strict';
const Koa = require('Koa');
const config = require('./config');
const myreply = require('./wx/reply');
const validate = require('./middleWare/validate');
var app = new Koa();

app.use(validate(config.wechat, myreply.reply));
app.listen(3333);
console.log("running 3333");
//node --harmony app.js
