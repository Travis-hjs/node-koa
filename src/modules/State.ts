import { 
    ResultSuccess,
    ResultFail
} from "./interfaces";

class ModuleState {

    /**
     * 拼接成功数据返回格式
     * @param data 成功返回数据
     * @param tip 成功提示文字
     */
    public getSuccessData(data: object | number | string, tip: string = null): ResultSuccess {
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
    public getFailData(tip: string): ResultFail {
        return {
            message: tip,
            code: 500
        }
    }
    
}

/** 状态信息管理 */
const stateInfo = new ModuleState();

export default stateInfo;