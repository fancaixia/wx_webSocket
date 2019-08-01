// pages/home/index.js
let config = require('../../utils/config.js')
let app = getApp();

Page({

  data: { },
  onLoad: function (options) {

  },

  // 创建 websocket  连接
  webSocket(user_id) {

    //loading 动画
    wx.showNavigationBarLoading()

    // 创建Socket 对象
    app.globalData.SocketTask = wx.connectSocket({
      url: `${config.wsAddress}?id=${user_id}`,
      data: '',
      header: {
        'content-type': 'application/json'
      },
      method: 'post',
      success: function (res) {
        console.log('WebSocket连接创建', res)
      },
      fail: function (err) {
        wx.showToast({
          title: '网络异常！',
        })
        console.log(err)
      },
    })

    app.globalData.SocketTask.onOpen(res => {

        console.log('WebSocket 连接打开', res)
        wx.hideNavigationBarLoading()
        wx.navigateTo({
          url: '/pages/chat/index'
        })

    })

    app.globalData.SocketTask.onError(res => {

      console.log('WebSocket 连接失败', res)

    })

    app.globalData.SocketTask.onMessage(msg => {

      app.globalData.Chatusers = JSON.parse(msg.data).len;

    })

  },
  gotochat(){

    // 后台发请求 建立连接 
    // 携带user_id  (此user_id 应为登陆后的user_id)
    this.webSocket(app.globalData.UserId);

  }



})