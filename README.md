## node + WebSocket 实现多人聊天室

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



