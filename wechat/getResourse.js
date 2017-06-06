/**
 * @Author: chenxuan
 * @Date:   2017-05-26T18:51:06+08:00
 * @Project: 小爬虫
 * @Filename: crawfer.js
 * @Last modified by:   chenxuan
 * @Last modified time: 2017-06-01T16:15:46+08:00
 */
'use strict';
const http = require('http');
const https = require('https');
const cheerio = require('cheerio'); //用法类似jq
var cronJob = require('cron').CronJob;
const wechat = require('./middleWare/wechat');
const config = require('./config');
var wechatApi = new wechat(config.wechat);


// data.media_id
var jianshuUrl = "http://www.jianshu.com/c/f489ec955505";
var juejin = "https://juejin.im/timeline?sort=newest";
var hacpai = "https://hacpai.com/domain/frontend";
var bokeyuan = "https://www.cnblogs.com/cate/javascript";
var imgUrl_id1 = "3BS_ek5tYVFiPGvBZrlf5uvkBR7JjVcusImp6gQr4XI"; //无图说毛 永久图片素材id
var imgUrl_id2 = "3BS_ek5tYVFiPGvBZrlf5qtSJzBXXdcO0byLN6d7TSc"; //女帝 永久图片素材id

var filterData1 = function (html) {
  var $ = cheerio.load(html),
    chapters = $(".note-list"),
    media = {
      articles: []
    },
    liList = chapters.children('li');
  liList.each(function (i, e) {
    if (i < 3) {
      var $this = $(this);
      var node = {
        title: $this.find(".title").text().trim(),
        thumb_media_id: imgUrl_id2,
        author: $this.find(".blue-link").text().trim(),
        digest: '没有摘要',
        show_cover_pic: 1,
        content: $this.find(".abstract").text().trim(),
        content_source_url: "http://www.jianshu.com" + $this.find(".title").attr("href")
      };
      media.articles.push(node);
    }
  });
  return media;
};
var filterData2 = function (html) {
  var $ = cheerio.load(html),
    chapters = $(".entry-list"),
    media = {
      articles: []
    },
    liList = chapters.children('li');
  liList.each(function (i, e) {
    if (i < 3) {
      var $this = $(this);
      var node = {
        title: $this.find(".title").text().trim(),
        thumb_media_id: imgUrl_id2,
        author: $this.find(".user-popover-box").text().trim(),
        digest: $this.find(".item.tag").text().trim(),
        show_cover_pic: 1,
        content: "此处点击查看原文sssssss！！！！",
        content_source_url: "https://juejin.im" + $this.find(".title").attr("href")
      };
      media.articles.push(node);
    }
  });
  return media;
};
var filterData3 = function (html) {
  var $ = cheerio.load(html),
    chapters = $(".article-list"),
    media = {
      articles: []
    },
    liList = chapters.find('li');
  liList.each(function (i, e) {
    if (i < 3) {
      var $this = $(this);
      var node = {
        title: $this.find(".ft-a-title").text().trim(),
        thumb_media_id: imgUrl_id2,
        author: $this.find(".author").text().trim(),
        digest: '没有摘要',
        show_cover_pic: 1,
        content: $this.find(".abstract").text().trim(),
        content_source_url: $this.find(".ft-a-title").attr("href")
      };
      media.articles.push(node);
    }
  });
  return media;
};
var filterData4 = function (html) {
  var $ = cheerio.load(html),
    chapters = $(".post_list"),
    media = {
      articles: []
    },
    liList = chapters.children('.post_item');
  liList.each(function (i, e) {
    if (i < 3) {
      var $this = $(this);
      var node = {
        title: $this.find(".titlelnk").text().trim(),
        thumb_media_id: imgUrl_id2,
        author: $this.find(".lightblue").text().trim(),
        digest: '没有摘要',
        show_cover_pic: 1,
        content: $this.find(".post_item_summary").text().trim(),
        content_source_url: $this.find(".titlelnk").attr("href")
      };
      media.articles.push(node);
    }
  });
  return media;
};
function getReq(url, cb, http) {
  http.get(url, function (res) {
    var html = "";
    res.on('data', function (data) {
      html += data;
    });
    res.on('end', function () {
      var media = cb(html);
      wechatApi.uploadMaterial('news', media, {}).then(function (msg) {
        console.log(msg);
        wechatApi.previewMass("mpnews", {
          "media_id": msg.media_id
        }, "o6xeAxI_X_5H8FP4oia9dQaxwnCs"); //先推送给大哥
        // wechatApi.previewMass("mpnews", {
        //   "media_id": msg.media_id
        // }, "o6xeAxNacdzISwtG2_KIBQvYWSAM"); //然后给小弟
      });

    });
  }).on('error', function (error) {
    console.log("error:" + error);
  });
}
new cronJob('00 10 9 * * *', function () {
  getReq(jianshuUrl, filterData1, http)
}, null, true, null);
new cronJob('00 30 11 * * *', function () {
  getReq(juejin, filterData2, https)
}, null, true, null);
new cronJob('00 30 15 * * *', function () {
  getReq(hacpai, filterData3, https)
}, null, true, null);
new cronJob('00 20 21 * * *', function () {
  getReq(bokeyuan, filterData4, https)
}, null, true, null);