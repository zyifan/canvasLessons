const fs = require('fs');
const path = require('path');
const Controller = require('egg').Controller;
const awaitWriteStream = require('await-stream-ready').write;
const sendToWormhole = require('stream-wormhole');
let co = require('co');
let OSS = require("ali-oss");

let client = new OSS({
  region: '',
  accessKeyId: '',
  accessKeySecret: '',
  bucket: ''
});

// https://help.aliyun.com/document_detail/32070.html

class UploadController extends Controller {
  async index() {
    const {
      ctx,
      service
    } = this;
    const stream = await this.ctx.getFileStream();

    let curD = Number(Math.random().toString().substr(3, 5) + Date.now()).toString(36);
    const filename = curD + path.extname(stream.filename).toLowerCase();
    const target = path.join(this.config.baseDir, 'app/web/asset/images/', filename);
    const writeStream = fs.createWriteStream(target);
    try {
      await awaitWriteStream(stream.pipe(writeStream));
    } catch (err) {
      await sendToWormhole(stream);
      throw err;
    }

    // 阿里云上传
    let local = './app/web/asset/images/' + filename;

    let end = {};

    await co(function* () {
      let result = yield client.put(filename, local);

      fs.unlinkSync(local);

      if(result.res.status == 200){
        end = {
          status: true,
          message: '上传成功',
          url: result.url
        }  
      }else{
        end = {
          status: false,
          message: '上传失败'          
        }
      }
     
    }).catch(function (err) {
      fs.unlinkSync(local);
      end = {
        status: false,
        message: e.message
      }
    });

    ctx.body = end;
  }

  async del() {
    const {
      ctx,
      service
    } = this;

    let data = ctx.request.body;
    let end = {};

    await co(function* () {
      let result = yield client.delete(data.filename);
      if(result.res.status == 204 || result.res.status == 200){
        end = {
          status: true,
          message: '删除成功',
        }
      }else{
        end = {
          status: false,
          message: '删除失败',
        }
      }
    
    }).catch(function (err) {
      end = {
        status: false,
        message: '删除失败'
      }
    });

    ctx.body = end;

  }
}

module.exports = UploadController;