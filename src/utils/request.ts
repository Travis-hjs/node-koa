import * as http from "http";
import * as querystring from "querystring"
import * as zlib from "zlib"
import { ServeRequestResult } from "./interfaces";

/**
 * 服务端请求
 * - [基础请求参考](https://www.cnblogs.com/liAnran/p/9799296.html)
 * - [响应结果乱码参考](https://blog.csdn.net/fengxiaoxiao_1/article/details/72629577)
 * - [html乱码参考](https://www.microanswer.cn/blog/51)
 * - [node-http文档](http://nodejs.cn/api/http.html#http_class_http_incomingmessage)
 * @param options 请求配置
 * @param params 请求传参数据
 */
export default function request(options: http.RequestOptions, params: object = {}): Promise<ServeRequestResult> {
    /** 返回结果 */
    const info: ServeRequestResult = {
        msg: "",
        result: "",
        state: -1
    }

    /** 传参字段 */
    const data = querystring.stringify(params as any);

    if (data && options.method == "GET") {
        options.path += `?${data}`;
    }
    
    return new Promise((resolve, reject) => {
        const clientRequest = http.request(options, res => {
            // console.log("http.get >>", res);
            console.log(`http.request.statusCode: ${res.statusCode}`);
            console.log(`http.request.headers: ${JSON.stringify(res.headers)}`);

            // 因为现在自己解码，所以就不设置编码了。
            // res.setEncoding("utf-8");

            if (res.statusCode !== 200) {
                info.msg = "请求失败";
                info.result = {
                    statusCode: res.statusCode,
                    headers: res.headers
                }
                return resolve(info);
            }

            let output: http.IncomingMessage | zlib.Gunzip

            if (res.headers["content-encoding"] == "gzip") {
                const gzip = zlib.createGunzip();
                res.pipe(gzip);
                output = gzip;
            } else {
                output = res;
            }

            output.on("data", function(chunk) {
                console.log("----------> chunk >>", chunk);
                // info.result += chunk;
                // info.result = chunk;
                // info.result += chunk.toString("utf-8");
                info.result += chunk.toString();
            });
            
            output.on("error", function(error) {
                console.log("----------> 服务端请求错误 >>", error);
                info.msg = error.message;
                info.result = error;
            })

            output.on("end", function() {
                console.log("---------- end ----------");
                if (res.complete) {
                    info.msg = "ok";
                    info.state = 1;
                    resolve(info);
                } else {
                    info.msg = "连接中断"
                    resolve(info);
                }
            });
            
        })
        
        if (data && options.method != "GET") {
            clientRequest.write(data)
        }

        clientRequest.end()
    })
}