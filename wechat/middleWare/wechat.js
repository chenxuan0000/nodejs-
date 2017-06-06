/**
 * @Author: chenxuan
 * @Date:   2017-05-27T22:32:33+08:00
 * @Project: 自定义
 * @Filename: wechat.js
 * @Last modified by:   chenxuan
 * @Last modified time: 2017-06-01T16:02:51+08:00
 */
'use strict';
const Promise = require('bluebird');
const util = require('./util');
const _ = require('lodash');
const fs = require('fs');
var request = Promise.promisify(require('request'));
var prefix = "https://api.weixin.qq.com/cgi-bin/";
var switchFalg = true;
var api = {
  accessToken: prefix + "token?grant_type=client_credential",
  tempoary: {
    upload: prefix + "media/upload?",
    fetch: prefix + "media/get?"
  },
  permanent: {
    upload: prefix + "material/add_material?", //新增其他类型永久素材
    fetch: prefix + "material/get_material?", //获取永久素材
    del: prefix + "material/del_material?", //获取永久素材
    count: prefix + "material/get_materialcount?", //获取素材总数
    batch: prefix + "material/batchget_material?", //获取素材列表
    update: prefix + "material/update_news?", //更新素材
    uploadNews: prefix + "material/add_news?", //新增永久图文素材
    uploadNewsPic: prefix + "media/uploadimg?" //上传图文消息内的图片获取URL
  },
  tag: {
    create: prefix + "tags/create?", //创建标签
    get: prefix + "tags/get?", //获取所有标签
    update: prefix + "tags/update?", //更新标签
    del: prefix + "tags/delete?", //删除标签目前有bug
    getfans: prefix + "user/tag/get?", //获取标签下粉丝情况
    batchtagging: prefix + "tags/members/batchtagging?", //批量为用户加标签
    unbatchtagging: prefix + "tags/members/batchuntagging?", //批量为用户取消标签
    searchtag: prefix + "tags/getidlist?" //获取用户的标签
  },
  user: {
    remark: prefix + "user/info/updateremark?",
    fetch: prefix + "user/info?",
    batchFetch: prefix + "user/info/batchget?",
    list: prefix + "user/get?",
  },
  mass: {
    sendbytag: prefix + "message/mass/sendall?", //根据标签进行群发【订阅号与服务号认证后均可用】
    sendbyopenid: prefix + "message/mass/send?", //根据openid发【订阅号不可用，服务号认证后可用】
    del: prefix + "message/mass/delete?", //群发之后，随时可以通过该接口删除群发
    preview: prefix + "message/mass/preview?", //预览接口 可以测试号发
    checkstate: prefix + "message/mass/get?", //查看发送状态是否成功
  },
  menu: {
    create: prefix + "menu/create?",
    get: prefix + "menu/get?",
    del: prefix + "menu/delete?",
    current: prefix + "get_current_selfmenu_info?" //获取菜单自定义接口
  }
};

function Wechat(opts) {
  this.appID = opts.appID;
  this.appSecret = opts.appSecret;
  this.getAccessToken = opts.getAccessToken;
  this.saveAccessToken = opts.saveAccessToken;
  if (switchFalg) { //防止new wechat多次更新票據
    switchFalg = false;
  this.fetchAccessToken();
    setTimeout(function () {
      switchFalg = true;
    }, 5000);
  }

}
//fetchAccessToken 验证是否可以通行
Wechat.prototype.fetchAccessToken = function (data) {
  var _this = this;
  
  return this.getAccessToken() //需要retuen回去一个promise
    .then(function (data) {
      try {
        data = JSON.parse(data);
      } catch (e) {
        return _this.updateAccessToken(); //更新票据
      }
      //是否合法检查 过期
      if (_this.isValidAccessToken(data)) {
        return Promise.resolve(data); //一定要return
      } else {
        return _this.updateAccessToken();
      }
    })
    .then(function (data) {
      _this.access_token = data.access_token;
      _this.expires_in = data.expires_in;
      _this.saveAccessToken(data);
      return Promise.resolve(_this);
    })
}
//验证方法
Wechat.prototype.isValidAccessToken = function (data) {
  if (!data || !data.access_token || !data.expires_in) {
    return false;
  }
  var access_token = data.access_token;
  var expires_in = data.expires_in;
  var now = (new Date()).getTime();

  if (now < expires_in) {
    return true;
  } else {
    return false;
  }
}
//更新票据
Wechat.prototype.updateAccessToken = function () {
  var appID = this.appID;
  var appSecret = this.appSecret;
  var url = api.accessToken + '&appid=' + appID + '&secret=' + appSecret;
  return new Promise(function (resolve, reject) {
    request({
      url: url,
      json: true
    }).then(function (reponse) {
      var data = reponse.body; //坑爹
      var now = (new Date()).getTime();
      var expires_in = now + (data.expires_in - 20) * 1000; //提前20s刷新票据
      data.expires_in = expires_in;
      console.log("更新票据：" + data);
      resolve(data);
    })
  })
}
//上传素材
Wechat.prototype.uploadMaterial = function (type, material, permanent) {
  var that = this;
  var form = {};
  var uploadUrl = api.tempoary.upload;
  if (permanent) {
    uploadUrl = api.permanent.upload;
    _.extend(form, permanent);
  }

  if (type === 'pic') {
    //图文消息图片
    uploadUrl = api.permanent.uploadNewsPic;
  }
  if (type === 'news') {
    //图文material是个数组
    uploadUrl = api.permanent.uploadNews;
    form = material;
  } else {
    //其他（图片，视频）material是个字符串路径
    form.media = fs.createReadStream(material);
  }
  return new Promise(function (resolve, reject) {
    that.
    fetchAccessToken()
      .then(function (data) {
        var url = uploadUrl + '&access_token=' + data.access_token;
        if (!permanent) {
          url += '&type=' + type;
        }
        var options = {
          method: 'POST',
          url: url,
          json: true
        };
        if (type === 'news') {
          options.body = form;
        } else {
          options.formData = form;
        }
        request(options).then(function (reponse) {
            var _data = reponse.body; //坑爹 原文写的reponse[1]
            if (_data) {
              resolve(_data);
            } else {
              throw new Error('upload material failed');
            }
          })
          .catch(function (err) {
            reject(err);
          })
      })
  })
}
//下载素材
Wechat.prototype.fetchMaterial = function (mediaId, type, permanent) {
  var that = this;
  var fetchUrl = api.tempoary.fetch;
  if (permanent) {
    fetchUrl = api.permanent.fetch;
  }
  return new Promise(function (resolve, reject) {
    that.
    fetchAccessToken()
      .then(function (data) {
        var url = fetchUrl + '&access_token=' + data.access_token;
        var options = {
          method: 'POST',
          url: url,
          json: true
        };
        var form = {};
        if (permanent) {
          form.media_id = mediaId;
          form.access_token = data.access_token;
          options.body = form;
        } else {
          if (type === 'video') {
            //video需要转唇膏http协议请求
            url = url.replace('https://', 'http://');
          }
          url += '&media_id=' + mediaId;
        }
        //分两种情况情况2直接返回url
        if (type === 'news' || type === 'video') {
          request(options).then(function (reponse) {
              var _data = reponse.body; //坑爹 原文写的reponse[1]
              if (_data) {
                resolve(_data);
              } else {
                throw new Error('fetch material failed');
              }
            })
            .catch(function (err) {
              reject(err);
            })
        } else {
          resolve(url);
        }

      })
  })
}
//删除永久素材
Wechat.prototype.deleteMaterial = function (mediaId) {
  var that = this;
  var form = {
    media_id: mediaId
  };
  return new Promise(function (resolve, reject) {
    that.
    fetchAccessToken()
      .then(function (data) {
        var url = api.permanent.del + '&access_token=' + data.access_token + '&media_id=' + mediaId;
        var options = {
          method: 'POST',
          url: url,
          body: form,
          json: true
        };
        request(options).then(function (reponse) {
            var _data = reponse.body; //坑爹 原文写的reponse[1]
            if (_data) {
              resolve(_data);
            } else {
              throw new Error('delete Material failed');
            }
          })
          .catch(function (err) {
            reject(err);
          })
      })
  })
}
//更新图文素材
Wechat.prototype.updateMaterial = function (mediaId, news) {
  var that = this;
  var form = {
    media_id: mediaId
  };
  _.extend(form, news);
  return new Promise(function (resolve, reject) {
    that.
    fetchAccessToken()
      .then(function (data) {
        var url = api.permanent.update + '&access_token=' + data.access_token + '&media_id=' + mediaId;
        var options = {
          method: 'POST',
          url: url,
          body: form,
          json: true
        };
        request(options).then(function (reponse) {
            var _data = reponse.body; //坑爹 原文写的reponse[1]
            if (_data) {
              resolve(_data);
            } else {
              throw new Error('deleteMaterial failed');
            }
          })
          .catch(function (err) {
            reject(err);
          })
      })
  })
}
//获取素材总数
Wechat.prototype.countMaterial = function () {
  var that = this;
  return new Promise(function (resolve, reject) {
    that.
    fetchAccessToken()
      .then(function (data) {
        var url = api.permanent.count + '&access_token=' + data.access_token;
        var options = {
          method: 'GET',
          url: url,
          json: true
        };
        request(options).then(function (reponse) {
            var _data = reponse.body; //坑爹 原文写的reponse[1]
            if (_data) {
              resolve(_data);
            } else {
              throw new Error('deleteMaterial failed');
            }
          })
          .catch(function (err) {
            reject(err);
          })
      })
  })
}
//获取素材列表
Wechat.prototype.batchMaterial = function (option) {
  var that = this;
  var options = {};
  options.type = option.type || 'image';
  options.offset = option.offset || 0;
  options.count = option.count || 3;
  return new Promise(function (resolve, reject) {
    that.
    fetchAccessToken()
      .then(function (data) {
        var url = api.permanent.batch + '&access_token=' + data.access_token;
        request({
            method: 'POST',
            url: url,
            body: options,
            json: true
          }).then(function (reponse) {
            var _data = reponse.body; //坑爹 原文写的reponse[1]
            if (_data) {
              resolve(_data);
            } else {
              throw new Error('delete material failed');
            }
          })
          .catch(function (err) {
            reject(err);
          })
      })
  })
}
//修改备注名
Wechat.prototype.remarkUser = function (openId, remark) {
  var that = this;
  return new Promise(function (resolve, reject) {
    that.
    fetchAccessToken()
      .then(function (data) {
        var url = api.user.remark + '&access_token=' + data.access_token;
        var options = {
          method: 'POST',
          url: url,
          body: options,
          json: true
        };
        request(options).then(function (reponse) {
            var _data = reponse.body; //坑爹 原文写的reponse[1]
            if (_data) {
              resolve(_data);
            } else {
              throw new Error('delete material failed');
            }
          })
          .catch(function (err) {
            reject(err);
          })
      })
  })
}
//batchFetch
Wechat.prototype.batchFetchUsers = function (openIds, lang = 'zh_CN') {
  var that = this;
  return new Promise(function (resolve, reject) {
    that.
    fetchAccessToken()
      .then(function (data) {
        var options = {
          json: true
        };
        if (_.isArray(openIds)) {
          options.url = api.user.batchFetch + '&access_token=' + data.access_token;
          options.body = {
            user_list: openIds
          }
          options.method = 'POST';
        } else {
          options.url = api.user.fetch + '&access_token=' + data.access_token +
            '&openid=' + openIds + '&lang=' + lang;

          options.method = 'GET';
          // console.log(options)
        }
        request(options).then(function (reponse) {
            var _data = reponse.body; //坑爹 原文写的reponse[1]
            if (_data) {
              resolve(_data);
            } else {
              throw new Error('batchFetchUsers failed');
            }
          })
          .catch(function (err) {
            reject(err);
          })
      })
  })
}
//获取用户列表 即关注者
Wechat.prototype.listUsers = function (openId) {
  var that = this;
  return new Promise(function (resolve, reject) {
    that.
    fetchAccessToken()
      .then(function (data) {
        var url = api.user.list + '&access_token=' + data.access_token;
        if (openId) {
          url += '&next_openid=' + openId;
        }
        var options = {
          // method: 'GET', 默认就是get可以省略
          url: url,
          json: true
        };
        request(options).then(function (reponse) {
            var _data = reponse.body; //坑爹 原文写的reponse[1]
            if (_data) {
              resolve(_data);
            } else {
              throw new Error('listUsers failed');
            }
          })
          .catch(function (err) {
            reject(err);
          })
      })
  })
}
//新增标签 及老版本的新增分组
Wechat.prototype.tagAdd = function (name = "随机分组名") {
  var that = this;
  return new Promise(function (resolve, reject) {
    that.
    fetchAccessToken()
      .then(function (data) {
        var url = api.tag.create + '&access_token=' + data.access_token;

        var options = {
          method: 'POST',
          url: url,
          body: {
            "tag": {
              "name": name //标签名
            }
          },
          json: true
        };
        request(options).then(function (reponse) {
            var _data = reponse.body; //坑爹 原文写的reponse[1]
            if (_data) {
              resolve(_data);
            } else {
              throw new Error('tagAdd failed');
            }
          })
          .catch(function (err) {
            reject(err);
          })
      })
  })
}
//获取所有已经创建的标签
Wechat.prototype.getAllTags = function () {
  var that = this;
  return new Promise(function (resolve, reject) {
    that.
    fetchAccessToken()
      .then(function (data) {
        var url = api.tag.get + '&access_token=' + data.access_token;
        var options = {
          url: url,
          json: true
        };
        request(options).then(function (reponse) {
            var _data = reponse.body; //坑爹 原文写的reponse[1]
            if (_data) {
              resolve(_data);
            } else {
              throw new Error('getAllTags failed');
            }
          })
          .catch(function (err) {
            reject(err);
          })
      })
  })
}
// 更新标签方法
Wechat.prototype.updateTag = function (id, name) {
  var that = this;
  return new Promise(function (resolve, reject) {
    that.
    fetchAccessToken()
      .then(function (data) {
        var url = api.tag.update + '&access_token=' + data.access_token;

        var options = {
          method: 'POST',
          url: url,
          body: {
            "tag": {
              "id": id,
              "name": name
            }
          },
          json: true
        };
        request(options).then(function (reponse) {
            var _data = reponse.body; //坑爹 原文写的reponse[1]
            if (_data) {
              resolve(_data);
            } else {
              throw new Error('updateTag failed');
            }
          })
          .catch(function (err) {
            reject(err);
          })
      })
  })
}
// 删除标签 分组
Wechat.prototype.deleteTag = function (id) {
  var that = this;
  return new Promise(function (resolve, reject) {
    that.
    fetchAccessToken()
      .then(function (data) {
        var url = api.tag.update + '&access_token=' + data.access_token;

        var options = {
          method: 'POST',
          url: url,
          body: {
            "tag": {
              "id": id
            }
          },
          json: true
        };
        console.log(options)
        request(options).then(function (reponse) {
            var _data = reponse.body; //坑爹 原文写的reponse[1]
            if (_data) {
              resolve(_data);
            } else {
              throw new Error('deleteTag failed');
            }
          })
          .catch(function (err) {
            reject(err);
          })
      })
  })
}
//获取该标签下粉丝列表 此接口官方文档描述有误为post
Wechat.prototype.getTagFans = function (tagid, next_openid = '') {
  var that = this;
  return new Promise(function (resolve, reject) {
    that.
    fetchAccessToken()
      .then(function (data) {
        var url = api.tag.getfans + '&access_token=' + data.access_token;
        var options = {
          method: 'POST',
          url: url,
          json: true,
          body: {
            "tagid": tagid,
            "next_openid": next_openid //第一个拉取的OPENID，不填默认从头开始拉取
          }
        };
        request(options).then(function (reponse) {
            var _data = reponse.body; //坑爹 原文写的reponse[1]
            if (_data) {
              resolve(_data);
            } else {
              throw new Error('getTagFans failed');
            }
          })
          .catch(function (err) {
            reject(err);
          })
      })
  })
}
//批量为用户加/取消标签分组
Wechat.prototype.batchtagging = function (openid_list, tagid, cancel) {
  var that = this;
  return new Promise(function (resolve, reject) {
    that.
    fetchAccessToken()
      .then(function (data) {
        var realPreUrl;
        if (cancel) {
          realPreUrl = api.tag.unbatchtagging;
        } else {
          realPreUrl = api.tag.batchtagging;
        }

        var url = realPreUrl + '&access_token=' + data.access_token;
        var options = {
          method: 'POST',
          url: url,
          json: true,
          body: { //粉丝列表
            "openid_list": openid_list,
            "tagid": tagid
          }
        };
        request(options).then(function (reponse) {
            var _data = reponse.body; //坑爹 原文写的reponse[1]
            if (_data) {
              resolve(_data);
            } else {
              throw new Error('getTagFans failed');
            }
          })
          .catch(function (err) {
            reject(err);
          })
      })
  })
}
//获取该用户标签
Wechat.prototype.searchTag = function (openid) {
  var that = this;
  return new Promise(function (resolve, reject) {
    that.
    fetchAccessToken()
      .then(function (data) {
        var url = api.tag.searchtag + '&access_token=' + data.access_token;
        var options = {
          method: 'POST',
          url: url,
          json: true,
          body: {
            "openid": openid
          }
        };
        request(options).then(function (reponse) {
            var _data = reponse.body; //坑爹 原文写的reponse[1]
            if (_data) {
              resolve(_data);
            } else {
              throw new Error('getTagFans failed');
            }
          })
          .catch(function (err) {
            reject(err);
          })
      })
  })
}
//根据标签进行群发【订阅号与服务号认证后均可用】 测试不了测试号没权限发{ errcode: 45028,errmsg: 'has no masssend quota hint: [wP0471ge21]' }
Wechat.prototype.sendByTag = function (type, message, tagId) { //发生消息类型，内容，标签id
  var that = this;
  var msg = {
    filter: {},
    msgtype: type //msgType被大小写坑了
  };
  msg[type] = message; //msgtype和类型是yiyi对应的
  if (!tagId) {
    msg.filter.is_to_all = true;
  } else {
    msg.filter = {
      "is_to_all": false,
      "tag_id": tagId
    }
  }

  return new Promise(function (resolve, reject) {
    that.
    fetchAccessToken()
      .then(function (data) {
        var url = api.mass.sendbytag + '&access_token=' + data.access_token;
        var options = {
          method: 'POST',
          url: url,
          json: true,
          body: msg
        };
        request(options).then(function (reponse) {
            var _data = reponse.body; //坑爹 原文写的reponse[1]
            if (_data) {
              resolve(_data);
            } else {
              throw new Error('sendByTag failed');
            }
          })
          .catch(function (err) {
            reject(err);
          })
      })
  })
}
//根据OpenID列表群发【订阅号不可用，服务号认证后可用】
Wechat.prototype.sendByOpenid = function (type, message, openIds) { //发生消息类型，内容，标签id
  var that = this;
  var msg = {
    msgtype: type, //msgType被大小写坑了
    touser: openIds
  };
  msg[type] = message;

  return new Promise(function (resolve, reject) {
    that.
    fetchAccessToken()
      .then(function (data) {
        var url = api.mass.sendbyopenid + '&access_token=' + data.access_token;
        var options = {
          method: 'POST',
          url: url,
          json: true,
          body: msg
        };
        request(options).then(function (reponse) {
            var _data = reponse.body; //坑爹 原文写的reponse[1]
            if (_data) {
              resolve(_data);
            } else {
              throw new Error('sendByOpenid failed');
            }
          })
          .catch(function (err) {
            reject(err);
          })
      })
  })
}
//删除群发【订阅号与服务号认证后均可用】 群发之后，随时可以通过该接口删除群发。
Wechat.prototype.deleteMass = function (msg_id, article_idx) { //article_idx 不填或者是0全删 1删第一篇文章
  var that = this;
  return new Promise(function (resolve, reject) {
    that.
    fetchAccessToken()
      .then(function (data) {
        var url = api.mass.sendbyopenid + '&access_token=' + data.access_token;
        var options = {
          method: 'POST',
          url: url,
          json: true,
          body: {
            "msg_id": msg_id,
            "article_idx": article_idx
          }
        };
        request(options).then(function (reponse) {
            var _data = reponse.body; //坑爹 原文写的reponse[1]
            if (_data) {
              resolve(_data);
            } else {
              throw new Error('deleteMass failed');
            }
          })
          .catch(function (err) {
            reject(err);
          })
      })
  })
}
//预览接口【订阅号与服务号认证后均可用】
Wechat.prototype.previewMass = function (type, message, openId) { //发生消息类型，内容，标签id
  var that = this;
  var msg = {
    msgtype: type, //msgType被大小写坑了
    touser: openId
  };
  msg[type] = message;

  return new Promise(function (resolve, reject) {
    that.
    fetchAccessToken()
      .then(function (data) {
        var url = api.mass.preview + '&access_token=' + data.access_token;
        var options = {
          method: 'POST',
          url: url,
          json: true,
          body: msg
        };
        request(options).then(function (reponse) {
            var _data = reponse.body; //坑爹 原文写的reponse[1]
            if (_data) {
              console.log("已经推送给我预览");
              resolve(_data);
            } else {
              throw new Error('sendByOpenid failed');
            }
          })
          .catch(function (err) {
            reject(err);
          })
      })
  })
}
//查询群发消息发送状态【订阅号与服务号认证后均可用】
Wechat.prototype.checkMass = function (msgId) { //发生消息类型，内容，标签id
  var that = this;
  return new Promise(function (resolve, reject) {
    that.
    fetchAccessToken()
      .then(function (data) {
        var url = api.mass.checkstate + '&access_token=' + data.access_token;
        var options = {
          method: 'POST',
          url: url,
          json: true,
          body: {
            "msg_id": msgId
          }
        };
        request(options).then(function (reponse) {
            var _data = reponse.body; //坑爹 原文写的reponse[1]
            if (_data) {
              resolve(_data);
            } else {
              throw new Error('checkMass failed');
            }
          })
          .catch(function (err) {
            reject(err);
          })
      })
  })
}
//创建菜单
Wechat.prototype.createMenu = function (menu) {
  var that = this;
  return new Promise(function (resolve, reject) {
    that.fetchAccessToken()
      .then(function (data) {
        var url = api.menu.create + '&access_token=' + data.access_token;
        var options = {
          method: 'POST',
          url: url,
          json: true,
          body: menu
        };
        request(options).then(function (reponse) {
            var _data = reponse.body; //坑爹 原文写的reponse[1]
            if (_data) {
              resolve(_data);
            } else {
              throw new Error('createMenu failed');
            }
          })
          .catch(function (err) {
            reject(err);
          })
      })
  })
}

//获取菜单
Wechat.prototype.getMenu = function () {
  var that = this;
  return new Promise(function (resolve, reject) {
    that.
    fetchAccessToken()
      .then(function (data) {
        var url = api.menu.get + '&access_token=' + data.access_token;
        var options = {
          url: url,
          json: true
        };
        request(options).then(function (reponse) {
            var _data = reponse.body; //坑爹 原文写的reponse[1]
            if (_data) {
              resolve(_data);
            } else {
              throw new Error('getMenu failed');
            }
          })
          .catch(function (err) {
            reject(err);
          })
      })
  })
}
//删除菜单
Wechat.prototype.deleteMenu = function () {
  var that = this;
  return new Promise(function (resolve, reject) {
    that.fetchAccessToken().then(function (data) {
      var url = api.menu.del + 'access_token=' + data.access_token;
      request({
        url: url,
        json: true
      }).then(function (response) {
        var _data = response.body;
        if (_data) {
          resolve(_data);
        } else {
          throw new Error('delete menu failed!');
        }
      }).catch(function (err) {
        reject(err);
      });
    });
  });
}
//获取自定义菜单配置接口
Wechat.prototype.getCurrentMenu = function () {
  var that = this;
  return new Promise(function (resolve, reject) {
    that.
    fetchAccessToken()
      .then(function (data) {
        var url = api.menu.current + '&access_token=' + data.access_token;
        var options = {
          url: url,
          json: true
        };
        request(options).then(function (reponse) {
            var _data = reponse.body; //坑爹 原文写的reponse[1]
            if (_data) {
              resolve(_data);
            } else {
              throw new Error('getCurrentMenu failed');
            }
          })
          .catch(function (err) {
            reject(err);
          })
      })
  })
}

//回复
Wechat.prototype.reply = function () {
  var content = this.body,
    message = this.weixin,
    xml = util.temp(content, message);
  this.status = 200;
  this.type = 'application/xml';
  this.body = xml;
}
module.exports = Wechat;