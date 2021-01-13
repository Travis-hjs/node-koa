import * as fs from "fs";
import * as path from "path";
import router from "./main";
import config from "../modules/Config";
import { UploadFile } from "../utils/interfaces";
import { apiSuccess } from "../utils/apiResult";

// 上传图片
// learn: https://www.cnblogs.com/nicederen/p/10758000.html
// learn: https://blog.csdn.net/qq_24134853/article/details/81745104
router.post("/uploadImg", async (ctx, next) => {

    const file: UploadFile = ctx.request.files[config.uploadImgName] as any;
    
    let fileName: string = ctx.request.body.name || `img_${Date.now()}`;

    fileName = `${fileName}.${file.name.split(".")[1]}`;

    // 创建可读流
    const render = fs.createReadStream(file.path);
    const filePath = path.join(config.uploadPath, fileName);
    const fileDir = path.join(config.uploadPath);

    if (!fs.existsSync(fileDir)) {
        fs.mkdirSync(fileDir);
    }

    // 创建写入流
    const upStream = fs.createWriteStream(filePath);

    render.pipe(upStream);

    // console.log(fileName, file);

    /** 模拟上传到七牛云 */
    function uploadApi(): Promise<{ image: string, file: string }> {
        const result = {
            image: "",
            file: ""
        }
        return new Promise(function (resolve) {
            const delay = Math.floor(Math.random() * 5) * 100 + 500;
            setTimeout(() => {
                result.image = `http://${ctx.headers.host}/${config.uploadPath}${fileName}`;
                result.file = `${config.uploadPath}${fileName}`;
                resolve(result);
            }, delay);
        });
    }

    const res = await uploadApi();

    ctx.body = apiSuccess(res, "上传成功");
})