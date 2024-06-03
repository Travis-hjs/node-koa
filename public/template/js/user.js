import { api, user } from "./api.js";
import { find, message, dialog, setGlobal } from "./utils.js";

const userInfo = user.getInfo();

function openUserPage() {
  location.href = "./api-login.html";
}

if (!userInfo) {
  openUserPage();
}

/**
 * 上传图片
 * @param {HTMLInputElement} el 
 */
async function uploadImg(el) {
  /** 上传文件 */
  const file = el.files[0];
  if (!file) return;
  // 判断文件类型
  if (!file.type.includes("image")) return dialog.show({ title: "操作提示", content: "文件格式只支持图片" });
  // 判断大小
  if (file.size > 5 * 1024 * 1024) return dialog.show({ title: "操作提示", content: "上传的文件不能大于5M" });

  const formData = new FormData();
  // formData.append("name", "hjs-img");
  formData.append("file", file);
  // console.log(formData);

  const res = await api.upload(formData)

  if (res.code === 1) {
    console.log("上传成功", res);
    el.parentNode.classList.add("hide");
    el.parentNode.parentNode.querySelector(".img-box").classList.remove("hide");
    el.parentNode.parentNode.querySelector(".img-box .image").src = res.data.image;
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
const listEl = find(".list");
/**
 * 模板内容 
 * @type {HTMLTemplateElement}
 */
const template = find("#list-item");

listEl.classList.add("hide");

/**
 * 输出列表item
 * @param {{ content: string, id: number }} item 
 */
function outputList(item) {
  const itemHTML = template.innerHTML.replace("{{id}}", item.id).replace("{{content}}", item.content);
  listEl.insertAdjacentHTML("beforeend", itemHTML);
  listEl.classList.remove("hide");
}

/**
 * 增加一条列表
 * @param {HTMLElement} el 
 */
async function onAdd(el) {
  /**
   * @type {HTMLInputElement}
   */
  const input = el.parentNode.querySelector(".input");
  const text = input.value.trim();
  if (!text) return message.error("输入的内容不能为空~");
  const res = await api.addListItem(text)
  if (res.code === 1) {
    console.log(res.data);
    outputList({
      content: text,
      id: res.data.id
    })
    input.value = "";
  }
}

/**
 * 删除当前列表
 * @param {HTMLElement} el 
 */
function onDelete(el) {
  // return console.log(el.parentNode.dataset["id"]);
  dialog.show({
    title: "确定删除？",
    content: "删除后不可恢复",
    async confirm() {
      const res = await api.deleteListItem(el.parentNode.dataset["id"])
      if (res.code === 1) {
        message.success("删除成功");
        el.parentNode.parentNode.removeChild(el.parentNode);
      }
    },
    cancelText: "取消"
  });
}

/**
 * 修改当前列表内容
 * @param {HTMLElement} el 自身节点
 */
async function submitEdit(el) {
  const id = el.parentNode.dataset["id"];
  const text = el.parentNode.querySelector(".input").value.trim();
  if (!text) return message.error("内容不能为空");
  // console.log(text, id);
  const res = await api.modifyListItem({
    content: text,
    id: id
  })
  if (res.code === 1) {
    message.success("修改成功");
    offInput(el);
  }
}

/**
 * 使输入框可以修改
 * @param {HTMLElement} el 自身节点
 */
function onEdit(el) {
  el.parentNode.querySelector(".the-btn.blue").classList.remove("hide");
  el.classList.add("hide");
  el.parentNode.querySelector(".input").removeAttribute("readonly");
}

/**
 * 使输入框不可以修改
 * @param {HTMLElement} el 自身节点
 */
function offInput(el) {
  el.parentNode.querySelector(".the-btn.blue").classList.add("hide");
  el.parentNode.querySelector(".the-btn.green").classList.remove("hide");
  el.parentNode.querySelector(".input").setAttribute("readonly", "readonly");
}

api.getTodoList().then(res => {
  if (res.code === 1) {
    console.log("获取列表", res);
    if (res.data.list.length == 0) return;
    res.data.list.forEach(item => {
      outputList(item);
    })
  }
})

async function getUserInfo() {
  const res = await api.getUserInfo()
  if (res.code === 1) {
    console.log("用户信息", res);
  }
}

async function onLogout() {
  const res = await api.logout()
  if (res.code === 1) {
    console.log("退出登录", res);
    user.remove();
    openUserPage();
  } else {
    user.remove();
  }
}

setGlobal({
  uploadImg,
  removeImg,
  onAdd,
  onDelete,
  submitEdit,
  onEdit,
  getUserInfo,
  onLogout,
});