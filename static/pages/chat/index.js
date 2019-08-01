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
