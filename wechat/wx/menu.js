/**
 * @Author: chenxuan
 * @Date:   2017-05-30T09:54:44+08:00
 * @Project: 自定义菜单数据
 * @Filename: menu.js
 * @Last modified by:   chenxuan
 * @Last modified time: 2017-05-30T13:53:39+08:00
 */

'use strict';
module.exports = {
  "button": [{
      "type": "view",
      "name": "h5页面展示",
      "url": "https://chenxuan0000.github.io/h5-css3/demo.html"
    },
    {
      "name": "菜单栏1",
      "sub_button": [{
          "type": "view",
          "name": "搜索",
          "url": "http://www.soso.com/"
        },
        {
          "type": "pic_sysphoto",
          "name": "弹出拍照",
          "key": "pic_photo"
        }, {
          "type": "pic_photo_or_album",
          "name": "弹出拍照相册",
          "key": "pic_photo_album"
        },
        {
          "type": "scancode_push",
          "name": "扫码推事件",
          "key": "qr_scan"
        },
        {
          "type": "scancode_waitmsg",
          "name": "扫码wating",
          "key": "qr_scan_wait"
        }
      ]
    }, {
      "name": "点出菜单2",
      "sub_button": [{
          "type": "pic_weixin",
          "name": "微信相册发图",
          "key": "pic_weixin"
        },
        {
          "type": "location_select",
          "name": "地理位置选择",
          "key": "location_select"
        },
        // {
        //   "type": "media_id",
        //   "name": "下发图标消息",
        //   "media_id": "****"
        // }
        // {
        //   "type": "view_limited",
        //   "name": "跳转图文消息的url",
        //   "media_id": "****"
        // }
      ]
    }
  ]
}
