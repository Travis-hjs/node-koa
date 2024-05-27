import { find, message, setGlobal } from "./utils.js";
import { api, user } from "./api.js";

/** 
 * @type {HTMLInputElement} 
*/
const loginAccount = find(".login_account");
/** 
 * @type {HTMLInputElement} 
*/
const loginPassword = find(".login_password");
/** 
 * @type {HTMLInputElement} 
*/
const registerAccount = find(".register_account");
/** 
 * @type {HTMLInputElement} 
*/
const registerPassword = find(".register_password");
/** 
 * @type {HTMLInputElement} 
*/
const registerName = find(".register_name");

async function onLogin() {
  const res = await api.login({
    account: loginAccount.value,
    password: loginPassword.value
  });
  if (res.code === 1) {
    console.log("登录成功", res);
    user.update(res.result);
    location.href = "api-user.html";
  }
}

async function onRegister() {
  const res = await api.register({
    account: registerAccount.value,
    password: registerPassword.value,
    name: registerName.value
  });
  if (res.code === 1) {
    console.log("register", res);
    loginAccount.value = registerAccount.value;
    loginPassword.value = registerPassword.value;
    onReset();
    message.success("注册成功");
  }
}

/** 重置注册信息 */
function onReset() {
  registerAccount.value = "";
  registerPassword.value = "";
  registerName.value = "";
}

/**
 * 回车事件
 * @param {KeyboardEvent} event 
 */
function onEnter(event) {
  if (event.key === "Enter" || event.keyCode === 13) {
    onLogin();
  }
}

loginPassword.addEventListener("keydown", onEnter);
loginAccount.addEventListener("keydown", onEnter);

setGlobal({
  onLogin,
  onRegister,
  onReset,
});
