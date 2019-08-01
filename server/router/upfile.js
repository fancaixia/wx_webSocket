let Router = require('koa-router')
const multer=require('koa-multer')
const fileRouter = new Router()
const path = require('path')
const uuid = require('uuid')
const fs = require('fs')

let utils = require('../utils/utils')

//文件上传
var storage = multer.diskStorage({
    //文件保存路径
    destination: function (req, file, cb) {
      cb(null, 'upload/')
    },
    //修改文件名称
    filename: function (req, file, cb) {
      var fileFormat = (file.originalname).split(".");  //以点分割成数组，数组的最后一项就是后缀名
      cb(null,Date.now() + "." + fileFormat[fileFormat.length - 1]);
    }
  })

  //加载文件配置
var upload = multer({ storage, });
fileRouter.get('/get',(ctx)=>{
  ctx.body={
    code:1,
    msg:'ok',
    data:'dddd'
  }
})


fileRouter.post('/upfile/add',upload.single('file'),async(ctx,next)=>{
  

    let file = ctx.req.file;
    let fromId = ctx.req.body.fromId;

    //拿到扩展名
    const extname = path.extname(file.originalname);
    //uuid生成图片名称
    const nameID = (uuid.v4()).replace(/\-/g,'');
    const oldpath = path.normalize(file.path);

    //新的路径
    let newfilename = nameID + extname;
    var newpath =  './upload/'+newfilename;
    //改名
    fs.rename(oldpath,newpath,function(err){
        // 改名失败
        if(err){
          ctx.body = {
            code:1,
            msg:'err',
            data:{}  
          }
        }
    })

    ctx.body = {
      code:0,
      msg:'ok'
    }

    // ws 广播消息
    utils.broadcastSendimg("image", newfilename, fromId)
   
  })

module.exports = fileRouter
