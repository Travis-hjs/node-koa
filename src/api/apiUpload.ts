import router from './main';
import * as Fs from 'fs';
import * as Path from 'path';
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
    const render = Fs.createReadStream(file.path);
    const filePath = Path.join(config.upload_path, fileName);
    const fileDir = Path.join(config.upload_path);

    if (!Fs.existsSync(fileDir)) {
        Fs.mkdirSync(fileDir);
    }

    // 创建写入流
    const upStream = Fs.createWriteStream(filePath);

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