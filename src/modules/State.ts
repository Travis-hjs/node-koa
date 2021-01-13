import { 
    ApiResult,
    ResultFail
} from "../utils/interfaces";

class ModuleState {

    /**
     * 拼接成功数据返回格式
     * @param data 成功返回数据
     * @param tip 成功提示文字
     */
    public getSuccessData(data: object | number | string, tip: string = null): ApiResult {
        return {
            message: tip || "success",
            code: 200,
            result: data 
        }
    }

    /**
     * 拼接失败数据返回格式
     * @param tip 失败提示文字
     */
    public getFailData(tip: string, code: number = 400): ResultFail {
        return {
            message: tip,
            code: code,
            result: 
        }
    }
    
}

/** 状态信息管理 */
const stateInfo = new ModuleState();

export default stateInfo;