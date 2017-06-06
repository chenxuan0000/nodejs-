/**
 * @Author: chenxuan
 * @Date:   2017-05-27T21:52:45+08:00
 * @Project: 自定义
 * @Filename: util.js
 * @Last modified by:   chenxuan
 * @Last modified time: 2017-05-30T13:53:23+08:00
 */

'use strict';
const fs = require('fs');
const Promise = require('bluebird');

exports.readFileAsync = function(fpath, encodning) {
  return new Promise(function(resolve, reject) {
    fs.readFile(fpath, encodning, function(err, content) {
      if (err) {
        reject(err)
      } else {
        resolve(content);
      }
    })
  })
}

exports.writeFileAsync = function(fpath, content) {
  return new Promise(function(resolve, reject) {
    fs.writeFile(fpath, content, function(err, content) {
      if (err) {
        reject(err)
      } else {
        resolve(content);
      }
    })
  })
}
