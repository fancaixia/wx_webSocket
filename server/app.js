let koa = require('koa')
const staticFile = require('koa-static')
let router = require('./router/upfile')
let path = require('path')
let url = require('url')

let ws = require('ws')
let socketServer = ws.Server
let utils = require('./utils/utils')


let app = new koa();
app.use(staticFile(path.join(__dirname + '/upload/'))) // 配置默认访问地址

let wss = new socketServer({port: 8080});    //创建websocketServer实例监听8080端口
let clientObj = require('./utils/setClients');  //创建客户端列表，用于保存客户端及相关连接信息

//监听连接
wss.on('connection', function(ws,req) {

    var parseObj = url.parse(req.url, true);

    clientObj.add({
        "id": parseObj.query.id,
        "ws": ws,
    })

    // 向前台发送聊天室用户信息
    utils.openSocket(ws, parseObj.query.id)

    /*监听并广播消息*/
    ws.on('message', function(message) {

        utils.broadcastSend(ws, "message", message, parseObj.query.id);
       
    });
    /*监听断开连接*/
    ws.on('close', function() {
        utils.closeSocket(ws, parseObj.query.id);
    })
})


app.use(router.routes());

app.listen(8090)