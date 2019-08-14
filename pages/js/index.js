const BASE_URL = 'http://10.0.18.116:1995';

/** 页面整体 */
const page = document.querySelector('.page');

function getData() {
    baseRequest('GET', BASE_URL + '/getHome', {
        id: 10
    }, res => {
        console.log('get 成功', res);

    }, err => {
        console.log('get 失败', err);
    });
}

function postData() {
    baseRequest('POST', BASE_URL + '/sendData', {
        name: 'hjs',
        age: new Date().getFullYear() - 1995,
        tall: '178cm'
    }, res => {
        console.log('post 成功', res);

    }, err => {
        console.log('post 失败', err);

    });
}

/**
 * 上传文件
 * @param {FormData} formdata 
 * @param {Function} success 
 * @param {Function} fail 
 */
function upload(formdata, success, fail) {
    baseRequest('POST', BASE_URL + '/uploadImg', {}, res => {
        if (typeof success === 'function') success(res);
    }, err => {
        if (typeof fail === 'function') fail(err);
    }, formdata);
}

/**
 * 获取二进制路径（需要打开服务器调试）
 * @param {File} file 文件
 */
function getObjectURL(file) {
    let url = null;
    if (window.createObjectURL) {
        url = window.createObjectURL(file);
    } else if (window.URL) {
        url = window.URL.createObjectURL(file);
    } else if (window.webkitURL) {
        url = window.webkitURL.createObjectURL(file);
    }
    return url;
}

/**
 * 上传图片
 * @param {HTMLInputElement} el 
 */
function uploadImg(el) {
    /** 上传文件 */
    const file = el.files[0];
    /** 上传类型数组 */
    const types = ['image/jpg', 'image/png', 'image/jpeg', 'image/gif'];
    // 判断文件类型
    if (types.indexOf(file.type) < 0) return alert('文件格式只支持：jpg 和 png');
    /** 判断大小 */
    if (file.size > 2 * 1024 * 1024) return alert('上传的文件不能大于2M');

    const formData = new FormData();
    formData.append('img', file);
    // console.log(formData);
    
    upload(formData, res => {
        console.log('上传成功', res);
    
        el.parentNode.classList.add('hide');
        el.parentNode.parentNode.querySelector('.img-box').classList.remove('hide');
        el.parentNode.parentNode.querySelector('.img-box .image').src = getObjectURL(file);
    }, err => {
        console.log('上传失败', err);
        
    })

    el.value = null;
}

/**
 * 清除图片
 * @param {HTMLElement} el 
 */
function removeImg(el) {
    el.parentNode.classList.add('hide');
    el.parentNode.querySelector('.image').src = '';
    el.parentNode.parentNode.querySelector('.upload').classList.remove('hide');
}