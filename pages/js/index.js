import api, {
    fetchUserInfo,
} from "./api.js";

import { 
    find, 
    showAlert, 
    toast 
} from "./utils.js";

const userInfo = fetchUserInfo();

if (!userInfo) {
    window.location.href = "user.html";
}

/** 页面整体 */
const page = find(".page");

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
    if (types.indexOf(file.type) < 0) return showAlert("文件格式只支持：jpg 和 png");
    // 判断大小
    if (file.size > 2 * 1024 * 1024) return showAlert("上传的文件不能大于2M");

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

const listNode = find(".list");

/**
 * 输出列表item
 * @param {{ content: string, id: string|number }} info 
 */
function ouputList(info) {
    const item = document.createElement("div");
    const input = document.createElement("input");
    const btnModify = document.createElement("button");
    const btnSub = document.createElement("button");
    const btnDelete = document.createElement("button");

    item.className = "card flex fvertical list-item";
    item.dataset.id = info.id;

    input.className = "input f1";
    input.type = "text";
    input.readOnly = true;
    input.value = info.content;

    btnModify.className = "button btn-green center";
    btnModify.onclick = function() {
        onInput(btnModify, input);
    }

    btnSub.className = "button btn-blue center hide";
    btnSub.onclick = function() {
        subChange(btnSub);
    }

    btnDelete.className = "button btn-red";
    btnDelete.onclick = function() {
        removeList(btnDelete);
    }

    item.append(input, btnModify, btnSub, btnDelete);
    listNode.appendChild(item);
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
    if (!text) return showAlert("输入的内容不能为空~");
    api.addListItem(text, res => {
        console.log(res.result);
        ouputList({
            content: text,
            id: res.result.id
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
 * @param {HTMLElement} el 
 */
function subChange(el) {
    let id = el.parentNode.dataset["id"];
    let text = el.parentNode.querySelector(".input").value.trim();
    if (!text) return showAlert("内容不能为空");
    // console.log(text, id);
    api.modifyListItem({
        content: text,
        id: id
    }, res => {
        console.log("修改成功", res);
        offInput(el);
    })
}

/**
 * 使输入框可以修改
 * @param {HTMLElement} el 
 * @param {HTMLInputElement} input
 */
function onInput(el, input) {
    el.parentNode.querySelector(".btn-blue").classList.remove("hide");
    el.classList.add("hide");
    input.removeAttribute("readonly");
}

/**
 * 使输入框不可以修改
 * @param {HTMLElement} el 
 */
function offInput(el) {
    el.parentNode.querySelector(".btn-blue").classList.add("hide");
    el.parentNode.querySelector(".btn-green").classList.remove("hide");
    el.parentNode.querySelector(".input").setAttribute("readonly", "readonly");
}   

api.getTodoList(res => {
    console.log("获取列表", res);
    if (res.result.list.length == 0) return;
    res.result.list.forEach(item => {
        ouputList(item);
    })
})

find(".btn_get").onclick = function() {
    api.testGet(10, res => {
        console.log("get 成功", res);
        toast.showToast("get 成功");
    })
} 

find(".btn_post").onclick = function() {
    api.testPost({
        name: "Hjs",
        age: new Date().getFullYear() - 1995,
    }, res => {
        console.log("post 成功", res);
        toast.showToast("post 成功");
    })
} 

find(".btn_userinfo").onclick = function() {
    api.getUserInfo(res => {
        console.log("用户信息", res);
    })
} 

find(".btn_logout").onclick = function() {
    api.logout(res => {
        console.log("退出登录", res);
        window.location.href = "user.html";
    })
} 

find(".btn_addlist").onclick = function() {
    addList(this);
}

find(".input_upload").onchange = function() {
    uploadImg(this);
}

find(".remove").onclick = function () {
    removeImg(this);
}