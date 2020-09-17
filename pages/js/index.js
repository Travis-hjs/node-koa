// 类型提示用（运行时不会引用）
/// <reference path="./api.js" />

const userInfo = fetchUserInfo();

if (!userInfo) {
    window.location.href = "user.html";
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
    const types = ["image/jpg", "image/png", "image/jpeg", "image/gif"];
    // 判断文件类型
    if (types.indexOf(file.type) < 0) return showAlert({ content: "文件格式只支持：jpg 和 png" });
    // 判断大小
    if (file.size > 2 * 1024 * 1024) return showAlert({ content: "上传的文件不能大于2M" });

    const formData = new FormData();
    // formData.append("name", "hjs-img");
    formData.append("img", file);
    // console.log(formData);
    
    api.upload(formData, res => {
        console.log("上传成功", res);
        const src = window.location.href.replace("pages/index.html", res.result.file) || getObjectURL(file);
        el.parentNode.classList.add("hide");
        el.parentNode.parentNode.querySelector(".img-box").classList.remove("hide");
        el.parentNode.parentNode.querySelector(".img-box .image").src = src;
    }, err => {
        console.log("上传失败", err);
        
    })

    el.value = null;
}

/**
 * 清除图片
 * @param {HTMLElement} el 
 */
function removeImg(el) {
    el.parentNode.classList.add("hide");
    el.parentNode.querySelector(".image").src = "";
    el.parentNode.parentNode.querySelector(".upload").classList.remove("hide");
}

/** 列表节点 */
const listEl = find(".list");

/**
 * 输出列表item
 * @param {{ content: string, list_id: string|number }} info 
 */
function ouputList(info) {
    const html = `
    <div class="card flex fvertical list_item" data-id="${info.list_id}">
        <input class="input f1" type="text" readonly="readonly" value="${info.content}">
        <button class="button button_green center" onclick="canInput(this)">修改</button>
        <button class="button button_blue center hide" onclick="subChange(this)">确定修改</button>
        <button class="button button_red" onclick="removeList(this)">删除</button>
    </div>
    `;
    listEl.insertAdjacentHTML("beforeend", html);
}

/**
 * 增加一条列表
 * @param {HTMLElement} el 
 */
function addList(el) {
    /**
     * @type {HTMLInputElement}
     */
    const input = el.parentNode.querySelector(".input");
    const text = input.value.trim();
    if (!text) return showAlert({ content: "输入的内容不能为空~" });
    api.addListItem(text, res => {
        console.log(res.result);
        ouputList({
            content: text,
            list_id: res.result.id
        })
        input.value = null;
    }) 
}

/**
 * 删除当前列表
 * @param {HTMLElement} el 
 */
function removeList(el) {
    // return console.log(el.parentNode.dataset["id"]);
    api.deleteListItem(el.parentNode.dataset["id"], res => {
        console.log("删除成功", res);
        toast.showToast("删除成功");
        el.parentNode.parentNode.removeChild(el.parentNode);
    })
}

/**
 * 修改当前列表内容
 * @param {HTMLElement} el 自身节点
 */
function subChange(el) {
    let id = el.parentNode.dataset["id"];
    let text = el.parentNode.querySelector(".input").value.trim();
    if (!text) return showAlert({ content: "内容不能为空" });
    // console.log(text, id);
    api.modifyListItem({
        content: text,
        id: id
    }, res => {
        console.log("修改成功", res);
        toast.showToast("修改成功");
        offInput(el);
    })
}

/**
 * 使输入框可以修改
 * @param {HTMLElement} el 自身节点
 */
function canInput(el) {
    el.parentNode.querySelector(".button_blue").classList.remove("hide");
    el.classList.add("hide");
    el.parentNode.querySelector(".input").removeAttribute("readonly");
}

/**
 * 使输入框不可以修改
 * @param {HTMLElement} el 自身节点
 */
function offInput(el) {
    el.parentNode.querySelector(".button_blue").classList.add("hide");
    el.parentNode.querySelector(".button_green").classList.remove("hide");
    el.parentNode.querySelector(".input").setAttribute("readonly", "readonly");
}   

api.getTodoList(res => {
    console.log("获取列表", res);
    if (res.result.list.length == 0) return;
    res.result.list.forEach(item => {
        ouputList(item);
    })
})

function clickGet() {
    api.testGet(10, res => {
        console.log("get 成功", res);
        toast.showToast("get 成功");
    })
} 

function clickPost() {
    api.testPost({
        name: "Hjs",
        age: new Date().getFullYear() - 1995,
    }, res => {
        console.log("post 成功", res);
        toast.showToast("post 成功");
    })
} 

function clickGetUserInfo() {
    api.getUserInfo(res => {
        console.log("用户信息", res);
    })
} 

function clickLogout() {
    api.logout(res => {
        console.log("退出登录", res);
        window.location.href = "user.html";
    })
} 

