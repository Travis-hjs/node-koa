const userInfo = fetchUserInfo();

if (!userInfo) {
    window.location.href = 'user.html';
}

/** 页面整体 */
const page = document.querySelector('.page');

function getData() {
    baseRequest('GET', '/getHome', {
        id: 10
    }, res => {
        console.log('get 成功', res);

    }, err => {
        console.log('get 失败', err);
    });
}

function postData() {
    baseRequest('POST', '/sendData', {
        name: 'hjs',
        age: new Date().getFullYear() - 1995,
    }, res => {
        console.log('post 成功', res);

    }, err => {
        console.log('post 失败', err);

    });
}

/**
 * 上传图片
 * @param {FormData} formdata 
 * @param {Function} success 
 * @param {Function} fail 
 */
function upload(formdata, success, fail) {
    baseRequest('POST', '/uploadImg', {}, res => {
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
    // 判断大小
    if (file.size > 2 * 1024 * 1024) return alert('上传的文件不能大于2M');

    const formData = new FormData();
    // formData.append('name', 'hjs-img');
    formData.append('img', file);
    // console.log(formData);
    
    upload(formData, res => {
        console.log('上传成功', res);
        const src = window.location.href.replace('pages/index.html', res.result.file) || getObjectURL(file);
        el.parentNode.classList.add('hide');
        el.parentNode.parentNode.querySelector('.img-box').classList.remove('hide');
        el.parentNode.parentNode.querySelector('.img-box .image').src = src;
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

/** 获取用户信息 */
function getUserInfo() {
    baseRequest('GET', '/getUserInfo', {}, res => {
        console.log('用户信息', res);

    }, err => {
        console.log('获取用户信息失败', err);
    });
}

/** 退出登录 */
function logout() {
    baseRequest('GET', '/logout', {}, res => {
        console.log('退出登录', res);
        window.location.href = 'user.html';
    }, err => {
        console.log('退出登录失败', err);
    });
}

const listNode = document.querySelector('.list');

/**
 * 输出列表item
 * @param {object} info 
 * @param {string} info.text 
 * @param {number} info.id 
 */
function ouputList(info) {
    const itme = `<div class="card flex fvertical list-item" data-id="${info.id}">
                    <input class="input f1" type="text" value="${info.text}" readonly="readonly">
                    <button class="button btn-green center" onclick="onInput(this)">修改</button>
                    <button class="button btn-blue center hide" onclick="subChange(this)">提交</button>
                    <button class="button btn-red" onclick="removeList(this)">删除</button>
                </div>`;
    listNode.insertAdjacentHTML('beforeend', itme);
}

/**
 * 增加一条列表
 * @param {HTMLElement} el 
 */
function addList(el) {
    /**
     * @type {HTMLInputElement}
     */
    const input = el.parentNode.querySelector('.input');
    if (!input.value.trim()) return alert('输入的内容不能为空~');
    ouputList({
        text: input.value.trim(),
        id: input.value.trim().length
    })
    input.value = null;
}

/**
 * 删除当前列表
 * @param {HTMLElement} el 
 */
function removeList(el) {
    el.parentNode.parentNode.removeChild(el.parentNode);
}

/**
 * 改变当前列表内容
 * @param {HTMLElement} el 
 */
function subChange(el) {
    let id = el.parentNode.dataset['id'];
    let text = el.parentNode.querySelector('.input').value.trim();
    if (!text) return alert('内容不能为空');
    console.log(text, id);
    
    offInput(el);
}

/**
 * 使输入框可以修改
 * @param {HTMLElement} el 
 */
function onInput(el) {
    el.parentNode.querySelector('.btn-blue').classList.remove('hide');
    el.classList.add('hide');
    el.parentNode.querySelector('.input').removeAttribute('readonly');
}

/**
 * 使输入框不可以修改
 * @param {HTMLElement} el 
 */
function offInput(el) {
    el.parentNode.querySelector('.btn-blue').classList.add('hide');
    el.parentNode.querySelector('.btn-green').classList.remove('hide');
    el.parentNode.querySelector('.input').setAttribute('readonly', 'readonly');
}   