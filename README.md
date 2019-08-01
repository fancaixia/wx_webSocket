## node + WebSocket 多人聊天室
[github:https://github.com/fancaixia/wx_webSocket](https://github.com/fancaixia/wx_webSocket)

![https://github.com/fancaixia/wx_websoket/blob/master/pic/chat.png](https://github.com/fancaixia/wx_websoket/blob/master/pic/chat.png)
<br/><br/>
### 案例思路： 
[1] ***用户进入聊天室***  <br/>   
- 前台向后台发送连接请求并携带用户id  <br/>
- 后台 let clients:[]  <br/>
- clients.push(ws:'socket对象',id:'用户id')<br/>
- 向前台广播当前聊天室人数<br/>

[2] ***用户退出聊天室***  <br/>    
- 后台遍历clients  查找与当前用户id 对应数据在cliens中删除 <br/>
- 向前台广播当前聊天室人数 <br/>

[3] ***聊天室用户发普通消息时***<br/>
- 后台收到消息并且向每个ws对象广播消息<br/>

[4] ***聊天室用户发图片时***<br/>
- 先将图片上传至服务器  （server / upload 目录）<br/>
- 然后广播 图片地址 <br/>
- 前台接收图片路径并渲染页面 <br/>

 `前台接收消息类型 type: message(普通消息) / image(图片消息) / loginin(进入聊天室) / loginout(退出聊天室)`

***~~~存在问题  微信小程序中onSocketOpen 在真机上不触发回调~~~***

### 代码结构：

##### 服务端代码
>server 
>>node_modules &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 项目依赖文件 <br/>
router  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;   处理上传文件模块 <br/>
upload   &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;  图片上传目录 <br/>
utils    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;  工具函数 <br/>
app.js   &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;  node主文件 <br/>

##### 小程序端代码

> static
>>utils &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 配置http及ws 地址 <br/>
pages  <br/>
>>> home &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 首页,处理websocket 连接<br/>
chat &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 聊天室页面<br/>


### 项目启动:

cd / server  <br/>
cnpm install <br/>
npm run dev <br/>

##### 小程序端模拟多人聊天
copy static <br/>
static / app.js  修改 UserId  创建多个用户进入聊天室


### 小程序代码片段:
pages / home / index.js
```
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
```
pages / chat / index.js
```
let config = require('../../utils/config.js')
let app = getApp();
Page({

  data: {
     socketMsg : '',  // 发送消息
     msg_data:[],      //会话内容 
  },

  // 进入页面获取 app.globalData.SocketTask
  onLoad(){

    wx.setNavigationBarTitle({
      title: '聊天室人数 / ' + app.globalData.Chatusers
    })

  },
  // 退出页面 断开socket 连接
 onUnload(){

   this.close_websocket();
   

 },
  onReady () {

    let { SocketTask } = app.globalData;
   
    SocketTask.onClose(onClose => {
      // console.log('监听 WebSocket 连接关闭事件。', onClose)

      this.close_websocket();

    })
    SocketTask.onError(onError => {
      // console.log('监听 WebSocket 错误。错误信息', onError)

      this.close_websocket();

    })
    SocketTask.onMessage(msg => {
      console.log('服务端数据返回：',msg)

      let { msg_data } = this.data;
      let { type } = JSON.parse(msg.data);

      // type 类型，message：普通消息，image:图片 , loginout：退出,  loginin：进入
      if (type == "message"){

        let { nickname, message, fromId } = JSON.parse(msg.data);
        // 根据app.globalData.UserId（当前用户id）判断发消息人
        let fromuser = 'other'
        if (fromId == app.globalData.UserId){
          fromuser = 'me'
        }

        msg_data.push({ type, nickname, message, fromId, fromuser })
        this.setData({
          msg_data,
        })

      } else if (type == "loginout" || type == "loginin"){

        // 用户退出 / 进入 聊天室
        app.globalData.Chatusers = JSON.parse(msg.data).len;
        wx.setNavigationBarTitle({
          title: '聊天室人数 / ' + app.globalData.Chatusers
        })

      } else if (type == "image" ){

        // 图片上传服务器成功后  ws广播
        let { msg_data } = this.data;
        let { src, type, fromId } = JSON.parse(msg.data);

        let fromuser = 'other'
        if (fromId == app.globalData.UserId) {
          fromuser = 'me'
        }
        msg_data.push({ type, src: `${config.httpAddress}/${src}`, fromId, fromuser, })

        this.setData({
          msg_data,
        })

      }

    })
  },

  // 断开连接
  close_websocket(){
    
    let { SocketTask } = app.globalData;

    if (app.globalData.SocketTask){
      SocketTask.close({
        code: 1000,
        success: (res) => {
          console.log('关闭成功', res)

          app.globalData.SocketTask = null;

        },
        fail: function (err) {
          console.log(err, "网络异常")
        },
        complete: () => {
          console.log('完成')
        }

      })
    }
    

  },

  // 更改 inpiut  value
  setstr(e){
      this.setData({
        socketMsg : e.detail.value
      })
  },
// 发送消息  
  sendMsg(){
    let { socketMsg } = this.data; 
    let { SocketTask } = app.globalData;

    // 检测空字符
    socketMsg = socketMsg.trim();
    if (socketMsg.length == 0){
      return;
    }

    SocketTask.send({
      data: socketMsg,
      success: (res) => {
        // console.log('发送成功', res)
        this.setData({
          socketMsg:''
        })
      },
      fail: function (err) {
        console.log(err,"网络异常")
      },

    })


  },
  // 图片上传
  add_photo(){
    let $this = this;

    wx.chooseImage({
      success(res) {

        const tempFilePaths = res.tempFilePaths

        const uploadTask = wx.uploadFile({
          url: `${config.httpAddress }/upfile/add`, // 图片上传接口地址
          filePath: tempFilePaths[0],
          name: 'file',
          formData: {
            'fromId': app.globalData.UserId
          },
          success(res) {
            // console.log(res,"图片上传到服务器")
          }
        })

      }
    })
  }


});

```

