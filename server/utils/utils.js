
let clientObj = require('./setClients'); 

module.exports = {
    /**
     *    广播普通消息
     *    type     广播方式  ( message )
     *    message  消息内容
     *    fromId   发送消息人id 
     */
    broadcastSend:( ws, type, message, fromId) => {

        const clients = clientObj.get(); 

        clients.forEach(function(v, i) {
            if(v.ws.readyState === ws.OPEN) {
                v.ws.send(JSON.stringify({
                    type,
                    message,
                    fromId
                }));
            }
        })
    },
    /**
     *    广播图片消息
     *    type     广播方式( image )
     *    src      图片名称
     *    fromId   发送消息人id 
     */
    broadcastSendimg : function( type, src, fromId) {

        const clients = clientObj.get(); 

        clients.forEach(function(v, i) {
                v.ws.send(JSON.stringify({
                    type,
                    src,
                    fromId
                }));
        })
    },
    /**
     * 广播所有客户端消息
     *   type     广播方式(loginin / loginout)
     *   message  消息内容
     *   len      当前聊天室人数
     */
    broadcastSendUser : function( ws, type, message) {

        const clients = clientObj.get(); 

        clients.forEach(function(v, i) {

                v.ws.send(JSON.stringify({
                    type,
                    message,
                    len:clients.length,
                }));
         
        })
    },

    /**
     * 打开服务，从客户端监听列表添加
     */
    openSocket : function(ws,id) {

        let message = id+'加入聊天室';
        this.broadcastSendUser( ws, "loginin", message);
    },

    /**
     * 关闭服务，从客户端监听列表删除
     */
    closeSocket : function( ws, id){

        let clients = clientObj.get(); 
        for(let i=0; i<clients.length; i++){

            if(clients[i].id == id){
                let obj = i;
                clientObj.reduce(obj);  //列表中删除 退出用户

                let message = id+'退出聊天室';
                this.broadcastSendUser( obj.ws, "loginout", message);

            }
        }

        
    }
}

