// 类型提示用（运行时不会引用）
/// <reference path="./api.js" />

const userInfo = user.getInfo();

function openUserPage() {
  location.href = "./api-login.html";
}

if (!userInfo) {
  openUserPage();
}

/**
 * 获取二进制路径（需要打开服务器调试）
 * @param {File} file 文件
 */
function getObjectURL(file) {
  let url;
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
async function uploadImg(el) {
  /** 上传文件 */
  const file = el.files[0];
  /** 上传类型数组 */
  const types = ["image/jpg", "image/png", "image/jpeg", "image/gif"];
  // 判断文件类型
  if (types.indexOf(file.type) < 0) return utils.showAlert({ content: "文件格式只支持：jpg 和 png" });
  // 判断大小
  if (file.size > 2 * 1024 * 1024) return utils.showAlert({ content: "上传的文件不能大于2M" });

  const formData = new FormData();
  // formData.append("name", "hjs-img");
  formData.append("img", file);
  // console.log(formData);

  const res = await api.upload(formData)

  if (res.code === 1) {
    console.log("上传成功", res);
    el.parentNode.classList.add("hide");
    el.parentNode.parentNode.querySelector(".img-box").classList.remove("hide");
    el.parentNode.parentNode.querySelector(".img-box .image").src = res.result.image;
  }

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
const listEl = utils.find(".list");
/** 模板内容 */
const template = listEl.children[0].innerHTML;
// 清空列表
listEl.innerHTML = null;

/**
 * 输出列表item
 * @param {{ content: string, id: number }} item 
 */
function ouputList(item) {
  const itemHTML = template.replace("{{id}}", item.id).replace("{{content}}", item.content);
  listEl.insertAdjacentHTML("beforeend", itemHTML);
}

/**
 * 增加一条列表
 * @param {HTMLElement} el 
 */
async function addList(el) {
  /**
   * @type {HTMLInputElement}
   */
  const input = el.parentNode.querySelector(".input");
  const text = input.value.trim();
  if (!text) return utils.showAlert({ content: "输入的内容不能为空~" });
  const res = await api.addListItem(text)
  if (res.code === 1) {
    console.log(res.result);
    ouputList({
      content: text,
      id: res.result.id
    })
    input.value = "";
  }
}

/**
 * 删除当前列表
 * @param {HTMLElement} el 
 */
async function removeList(el) {
  // return console.log(el.parentNode.dataset["id"]);
  const res = await api.deleteListItem(el.parentNode.dataset["id"])
  if (res.code === 1) {
    console.log("删除成功", res);
    utils.showToast("删除成功");
    el.parentNode.parentNode.removeChild(el.parentNode);
  }
}

/**
 * 修改当前列表内容
 * @param {HTMLElement} el 自身节点
 */
async function subChange(el) {
  const id = el.parentNode.dataset["id"];
  const text = el.parentNode.querySelector(".input").value.trim();
  if (!text) return utils.showAlert({ content: "内容不能为空" });
  // console.log(text, id);
  const res = await api.modifyListItem({
    content: text,
    id: id
  })
  if (res.code === 1) {
    console.log("修改成功", res);
    utils.showToast("修改成功");
    offInput(el);
  }
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

api.getTodoList().then(res => {
  if (res.code === 1) {
    console.log("获取列表", res);
    if (res.result.list.length == 0) return;
    res.result.list.forEach(item => {
      ouputList(item);
    })
  }
})

async function clickGetUserInfo() {
  const res = await api.getUserInfo()
  if (res.code === 1) {
    console.log("用户信息", res);
  }
}

async function clickLogout() {
  const res = await api.logout()
  if (res.code === 1) {
    console.log("退出登录", res);
    user.remove();
    openUserPage();
  } else {
    user.remove();
  }
}

