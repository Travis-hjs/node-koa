import type { UploadFile } from "../types/base";
import * as fs from "fs";
import * as path from "path";
import router from "./main";
import { config } from "../modules";
import { apiSuccess } from "../utils/apiResult";

// 上传文件
// learn: https://www.cnblogs.com/nicederen/p/10758000.html
// learn: https://blog.csdn.net/qq_24134853/article/details/81745104
// [图片类型参考](https://developer.mozilla.org/zh-CN/docs/Web/Media/Formats/Image_types#webp_image)
router.post("/uploadFile", async (ctx, next) => {

  const file: UploadFile = ctx.request.files[config.uploadName] as any;
  // console.log("file >>", file);
  const fileName = file.originalFilename;
  // console.log("fileName >>", fileName);
  const isImage = file.mimetype && file.mimetype.includes("image");
  /** 目录名 */
  const folder = isImage ? "/images/" : "/assets/";
  /** 上传的资源目录名 */
  const folderPath = config.uploadPath + folder;

  // 创建可读流
  const render = fs.createReadStream(file.filepath);
  const filePath = path.join(folderPath, fileName);
  const fileDir = path.join(folderPath);

  if (!fs.existsSync(fileDir)) {
    fs.mkdirSync(fileDir);
  }

  // 创建写入流
  const upStream = fs.createWriteStream(filePath);

  render.pipe(upStream);

  // console.log(fileName, file);

  /** 模拟上传到`oss`云存储 */
  function uploadToCloud() {
    const result = {
      image: ""
    }
    return new Promise<{ image: string }>(function (resolve) {
      const delay = Math.floor(Math.random() * 5) * 100 + 500;
      setTimeout(() => {
        result.image = `http://${config.ip}:${config.port}${folder}${fileName}`;
        resolve(result);
      }, delay);
    });
  }

  const res = await uploadToCloud();

  ctx.body = apiSuccess(res, "上传成功");
})