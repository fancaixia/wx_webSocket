module.exports = {

    clients:[],
    add:function(client){

      this.clients.push(client)

    },
    reduce:function(obj){

        this.clients.splice(obj,1)

    },
    get:function(){
         
        return this.clients;
    }

}