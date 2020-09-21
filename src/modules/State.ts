import { 
    ResultSuccess,
    ResultFail
} from "./interfaces";

class ModuleState {

    /** 成功提示 */
    private success: ResultSuccess = {
        message: "",
        code: 200,
        result: {}
    }

    /** 失败提示 */
    private fail: ResultFail = {
        message: "",
        code: 500,
    }

    /**
     * 拼接成功数据返回格式
     * @param data 成功返回数据
     * @param tip 成功提示文字
     */
    public getSuccessData(data: object | number | string, tip: string = null) {
        const info = this.success;
        info.result = data;
        info.message = tip || "success";
        return info;
    }

    /**
     * 拼接失败数据返回格式
     * @param tip 失败提示文字
     */
    public getFailData(tip: string) {
        const info = this.fail;
        info.message = tip;
        return info;
    }
    
}

/** 状态信息管理 */
const stateInfo = new ModuleState();

export default stateInfo;