class ModuleUtils {
    /**
     * 格式化?后面参数成 JSON 对象
     * @param value 
     * @example {
     * searchFormat(window.location.search);
     * }
    */
    public searchFormat(value: string) {
        return JSON.parse(`{"${decodeURIComponent(value.substring(1)).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"')}"}`);
    }

    /**
     * rgb 转 16进制 
     * @param string rgb(125, 125, 125)
     */
    public rgbToHex(string: string) {
        var rgb = string.split(',');
        var r = parseInt(rgb[0].split('(')[1]);
        var g = parseInt(rgb[1]);
        var b = parseInt(rgb[2].split(')')[0]);
        var hex = '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
        return hex;
    }

    /** 
    * hex16 进制颜色转 rgb(rgba)
    * @param hex '#23ff45' 
    */
    public hexToRgb(hex: string) {
        return 'rgb(' + parseInt('0x' + hex.slice(1, 3)) + ',' + parseInt('0x' + hex.slice(3, 5)) + ',' + parseInt('0x' + hex.slice(5, 7)) + ')';
    }

    /**
     * 范围随机数
     * @param min 最小数
     * @param max 最大数
     */
    public ranInt(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * 随机打乱数组
     * @param array
     */
    public shuffleArray(array: Array<any>) {
        for (let i = array.length - 1; i >= 0; i--) {
            let randomIndex = Math.floor(Math.random() * (i + 1));
            let itemAtIndex = array[randomIndex];
            array[randomIndex] = array[i];
            array[i] = itemAtIndex;
        }
        return array;
    }

    /**
     * 数组中随机取几个元素
     * @param array 数组
     * @param count 元素个数
     */
    public getRandomArrayElements(array: Array<any>, count: number) {
        let length = array.length;
        let min = length - count;
        let index = 0;
        let value = '';
        while (length-- > min) {
            index = Math.floor((length + 1) * Math.random());
            value = array[index];
            array[index] = array[length];
            array[length] = value;
        }
        return array.slice(min);
    }

    /**
     * utils 打印
     * @param agr 
     */
    public log(...agr: any) {
        console.log('utils.log >>', ...agr);
    }
}

/** 工具模块 */
const utils = new ModuleUtils;

export default utils;