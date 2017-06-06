/**
 * @Author: chenxuan
 * @Date:   2017-05-28T22:53:53+08:00
 * @Project: 自定义
 * @Filename: weixin.js
 * @Last modified by:   chenxuan
 * @Last modified time: 2017-06-01T16:14:43+08:00
 */
'use strict';
const fs = require('fs');
const path = require('path');
const wechat = require('../middleWare/wechat');
const config = require('../config');
const pancong = require('../getResourse');
const menu = require('./menu');
var wechatApi = new wechat(config.wechat);
wechatApi.deleteMenu().then(function (msg) {
  console.log(msg);
  return wechatApi.createMenu(menu);
}).then(function (msg) {
  console.log(msg);
});
exports.reply = function* (next) {
  var message = this.weixin;
  if (message.MsgType === 'event') {
    if (message.Event === 'subscribe') {
      if (message.EventKey) {
        console.log("通过二维码扫描进入:" + message.EventKey + " " + message.ticket);
      }
      this.body = "hello！！！！这是测试号，微信接口的基本功能都已经完成，目前主要是做了爬虫，定时去各大前端博客爬取推送到公众号，由于不能群发，只能支持预览推送，有需求联系我加入后台配置。";
    } else if (message.Event === 'unsubscribe') {
      console.log("你取消了关注！！！！！");
      this.body = "";
    } else if (message.Event === 'LOCATION') {
      // this.body = "你上报的位置是：" + message.Latitude + '/' + message.Longitude + '-' + message.Precision;
    } else if (message.Event === 'CLICK') { //点击
      this.body = "点击了菜单：" + message.EventKey;
    } else if (message.Event === 'SCAN') { //扫描
      this.body = "点击了菜单：" + message.EventKey;
      console.log("关注后扫二维码：" + message.EventKey + ' ' + message.Ticket);
      this.body = "看到了请扫下oooooo";
    } else if (message.Event === 'VIEW') { //视图
      this.body = "你点击了菜单中的链接：" + message.EventKey; //菜单url地址
    } else if (message.Event === 'scancode_push') { //码推事件
      console.log(message.ScanCodeInfo.ScanType);
      console.log(message.ScanCodeInfo.ScanResult);
      this.body = "你点击了码推事件：" + message.ScanCodeInfo.ScanResult;
    } else if (message.Event === 'scancode_waitmsg') { //码推事件
      console.log(message.ScanCodeInfo.ScanType);
      console.log(message.ScanCodeInfo.ScanResult);
      this.body = "扫码推事件且弹出“消息接收中”提示框的事件推送：" + message.EventKey; //菜单url地址
    } else if (message.Event === 'pic_sysphoto') {
      console.log(message.SendPicsInfo.Count);
      console.log(message.SendPicsInfo.PicList);
      this.body = "弹出系统拍照图片";
    } else if (message.Event === 'pic_photo_or_album') {
      console.log(message.SendPicsInfo.Count);
      console.log(message.SendPicsInfo.PicList);
      this.body = "弹出拍照或者相册发图的事件推送：";
    } else if (message.Event === 'pic_weixin') {
      console.log(message.SendPicsInfo.Count);
      console.log(message.SendPicsInfo.PicList);
      this.body = "弹出微信相册发图器的事件推送：";
    } else if (message.Event === 'location_select') {
      console.log(message.SendLocationInfo.Location_X);
      console.log(message.SendLocationInfo.Location_Y);
      console.log(message.SendLocationInfo.Scale);
      console.log(message.SendLocationInfo.Label);
      console.log(message.SendLocationInfo.Poiname);
      // this.body = "弹出地理位置选择器的事件推送：" + message.EventKey;
    }
  } else if (message.MsgType === "text") { //大小写很严格。。。msgType XXXX
    var content = message.Content;
    var reply = "你的太快了 " + content + "慢点!!!";

    switch (content) {
      case "1":
        reply = "新点装逼王是谁？？";
        break;
      case "2":
        reply = "是赵阳";
        break;
      case "3":
        reply = [{
          title: "苦练装逼技术",
          description: "6666",
          picUrl: "https://gss0.bdstatic.com/70cFsjip0QIZ8tyhnq/img/iknow/pgc/270x116.jpg?t=1495687034",
          url: "http://www.jianshu.com/u/d9dac4e9d523"
        }];
        break;
      case "4":
        reply = [{
            title: "苦练装逼技术",
            description: "66666666",
            picUrl: "https://ubmcmm.baidustatic.com/media/v1/0f0002EGawuS9CaJEw2vF6.jpg",
            url: "https://mp.weixin.qq.com/wiki"
          },
          {
            title: "nodejs测试接口",
            description: "装逼王简书",
            picUrl: "https://gss0.bdstatic.com/70cFsjip0QIZ8tyhnq/img/iknow/pgc/270x116.jpg?t=1495687034",
            url: "http://www.jianshu.com/u/d9dac4e9d523"
          }
        ];
        break;
      case "5":
        var data = yield wechatApi.uploadMaterial("image", path.join(__dirname, '../test1.jpg'));
        reply = {
          type: "image",
          mediaId: data.media_id
        }
        console.log(data.media_id)
        break;
      case "6":
        var data = yield wechatApi.uploadMaterial("video", path.join(__dirname, '../test.mp4'));
        reply = {
          type: "video",
          mediaId: data.media_id,
          title: "nodejs微信公众号",
          description: "第四天课程介绍"
        }
        break;
        // case "7":
        //   var data = yield wechatApi.uploadMaterial("image", path.join(__dirname, '../yyy.JPG'), {
        //     type: 'image'
        //   });
        //   reply = {
        //     type: "image",
        //     mediaId: data.media_id
        //   }
        //   console.log(data.media_id);
        //   break;
        // case "8":
        //   var data = yield wechatApi.uploadMaterial("video", path.join(__dirname, '../test.mp4'), {
        //     type: 'video',
        //     description: '{"title": "real a bad day","introduction": "sha bi"}'
        //   });
        //   //这里的第三个参数里面的description 格式需要注意
        //   reply = {
        //     type: "video",
        //     mediaId: data.media_id,
        //     title: "nodejs微信公众号",
        //     description: "第四天课程介绍"
        //   }
        //   break;
        // case "9":
        //   //拿到素材的id,来上传图文
        //   var picData = yield wechatApi.uploadMaterial("image", path.join(__dirname, '../test.jpg'), {});
        //   console.log(picData);
        //   var media = {
        //     articles: [{
        //       title: "测试上传接口",
        //       thumb_media_id: picData.media_id,
        //       author: 'chenxuan',
        //       digest: "么有摘要",
        //       show_cover_pic: 1,
        //       content: "内容11111111111111111",
        //       content_source_url: "https://www.baidu.com/"
        //     }, {
        //       title: "测试上传接口",
        //       thumb_media_id: picData.media_id,
        //       author: 'chenxuan',
        //       digest: "么有摘要",
        //       show_cover_pic: 1,
        //       content: "内容11111111111111111",
        //       content_source_url: "https://www.baidu.com/"
        //     }, {
        //       title: "测试上传接口",
        //       thumb_media_id: picData.media_id,
        //       author: 'chenxuan',
        //       digest: "么有摘要",
        //       show_cover_pic: 1,
        //       content: "内容11111111111111111",
        //       content_source_url: "https://www.baidu.com/"
        //     }]
        //   };
        //   data = yield wechatApi.uploadMaterial('news', media, {});
        //   data = yield wechatApi.fetchMaterial(data.media_id, 'news', {});
        //   var items = data.news_item; //获取素材总数
        //   var news = [];
        //   items.forEach(function(item) {
        //     news.push({
        //       title: item.title,
        //       description: item.digest,
        //       picUrl: picData.url,
        //       url: item.url
        //     })
        //   })
        //   reply = news;
        //   break;
      case "10":
        var counts = yield wechatApi.countMaterial();
        console.log(JSON.stringify(counts));
        reply = JSON.stringify(counts);
        break;
      case "11":
        var list = yield [wechatApi.batchMaterial({
          type: 'imgae',
          offset: 0,
          count: 10
        }), wechatApi.batchMaterial({
          type: 'video',
          offset: 0,
          count: 10
        }), wechatApi.batchMaterial({
          type: 'voice',
          offset: 0,
          count: 10
        }), wechatApi.batchMaterial({
          type: 'news',
          offset: 0,
          count: 10
        })];
        console.log(JSON.stringify(list));
        reply = JSON.stringify(list);
        break;
      case "12":
        var user = yield wechatApi.batchFetchUsers(message.FromUserName);
        //这里获取用户基本信息
        console.log(user);
        var openIds = [{
          openid: message.FromUserName,
          lang: 'en'
        }];
        var users = yield wechatApi.batchFetchUsers(openIds);
        console.log(users);
        reply = JSON.stringify(user);
        break;
      case "13":
        var userlist = yield wechatApi.listUsers();
        //这里获取用户列表
        console.log(userlist);
        reply = userlist.total; //返回关注人数
        break;
      case "14":
        var data = yield wechatApi.countMaterial();
        //这里获取用户列表
        console.log(data);
        reply = data; //返回关注人数
        break;

      case "music":
        var data = yield wechatApi.uploadMaterial("image", path.join(__dirname, '../test.jpg'));
        reply = {
          type: "music",
          musicUrl: "http://music.163.com/#/song?id=2526613",
          title: "dota-music",
          description: "dddddddd",
          thumbMediaId: data.media_id
        }
        console.log(reply)
        break;
      case "addtag":
        var tag = yield wechatApi.tagAdd("旷工组");
        console.log(JSON.stringify(tag));
        reply = JSON.stringify(tag);
        break;
      case "gettag":
        var tags = yield wechatApi.getAllTags();
        console.log(JSON.stringify(tags));
        reply = JSON.stringify(tags);
        break;
      case "updatetag":
        var tag = yield wechatApi.updateTag(100, "装逼组");
        console.log(JSON.stringify(tag));
        reply = JSON.stringify(tag);
        break;
      case "deltag":
        var tag = yield wechatApi.deleteTag(102);
        console.log(JSON.stringify(tag));
        reply = JSON.stringify(tag);
        break;
      case "getfans":
        var tag = yield wechatApi.getTagFans(100, '');
        console.log(JSON.stringify(tag));
        reply = JSON.stringify(tag);
        break;
      case "fansaddtag": //批量给用户加标签
        var tag = yield wechatApi.batchtagging(['o6xeAxNacdzISwtG2_KIBQvYWSAM',
            'o6xeAxI_X_5H8FP4oia9dQaxwnCs',
            'o6xeAxO0DEp4WOohGlFsyUiXhCsg',
            'o6xeAxH2w-5gDe1DsnQ5_bJD8_eM'
          ],
          100);
        console.log(JSON.stringify(tag));
        reply = JSON.stringify(tag);
        break;
      case "fansremovetag": //批量给用户取消标签
        var tag = yield wechatApi.batchtagging(['o6xeAxH2w-5gDe1DsnQ5_bJD8_eM'],
          100, true); //注意这里要第三个参数表示取消
        console.log(JSON.stringify(tag));
        reply = JSON.stringify(tag);
        break;
      case "searchtag": //search 用户tag
        var tag = yield wechatApi.searchTag("o6xeAxI_X_5H8FP4oia9dQaxwnCs");
        console.log(JSON.stringify(tag));
        reply = JSON.stringify(tag);
        break;
      case "sendall": //跟据标签群发
        var image = {
          "media_id": "3BS_ek5tYVFiPGvBZrlf5kK6ePJkH3XgjknCo0u_KLg"
        };
        var msgData = yield wechatApi.sendByTag("image", image, 100);
        console.log(msgData);
        reply = "群发成功！！！！"
        break;
      case "preview": //跟据openid 发预览接口 可以成功测试号
        var image = {
          "media_id": "3BS_ek5tYVFiPGvBZrlf5kK6ePJkH3XgjknCo0u_KLg"
        };
        var msgData = yield wechatApi.previewMass("image", image, "o6xeAxI_X_5H8FP4oia9dQaxwnCs");
        console.log(msgData);
        reply = "发了！！！！"
        break;
        // case "checksend": //测试群发或者发送是否成功状态 获取不到msgId 暂时注释
        //   var msgData = yield wechatApi.checkMass(msgId: ? );
        //   console.log(msgData);
        //   reply = "发了！！！！"
        //   break;
      case "delmenu": //删除自定义菜单
        var tag = yield wechatApi.deleteMenu();
        console.log(JSON.stringify(tag));
        reply = JSON.stringify(tag);
        break;
      case "addmenu": //新增自定义菜单
        var tag = yield wechatApi.createMenu(menu);
        console.log(menu);
        console.log(JSON.stringify(tag));
        reply = JSON.stringify(tag);
        break;
      default:
        reply = "我不认识你！！！";
        break;
    }
    this.body = reply;
  }
  yield next;
}