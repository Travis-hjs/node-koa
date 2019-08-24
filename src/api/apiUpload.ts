import * as fs from 'fs';
import * as path from 'path';
import router from './main';
import config from '../modules/config';
import stateInfo from '../modules/state';

// 上传图片
// learn: https://www.cnblogs.com/nicederen/p/10758000.html
// learn: https://blog.csdn.net/qq_24134853/article/details/81745104
router.post('/uploadImg', async (ctx, next) => {
    const file = ctx.request.files[config.upload_img_name];
    let fileName = ctx.request.body.name || `img_${Date.now()}`;
    fileName = `${fileName}.${file.name.split('.')[1]}`;

    // 创建可读流
    const render = fs.createReadStream(file.path);
    const filePath = path.join(config.upload_path, fileName);
    const fileDir = path.join(config.upload_path);

    if (!fs.existsSync(fileDir)) {
        fs.mkdirSync(fileDir);
    }

    // 创建写入流
    const upStream = fs.createWriteStream(filePath);

    render.pipe(upStream);

    // console.log(fileName, file);

    const result = {
        image: '',
        file: ''
    }

    /** 模拟上传到七牛云 */
    function uploadApi() {
        return new Promise(function (resolve, reject) {
            const delay = Math.floor(Math.random() * 5) * 100 + 500;
            setTimeout(() => {
                result.image = `http://${ctx.headers.host}/${config.upload_path}${fileName}`;
                result.file = `${config.upload_path}${fileName}`;
                resolve();
            }, delay);
        });
    }

    await uploadApi();

    ctx.body = stateInfo.getSuccessData(result, '上传成功');
})