// 类型提示用（运行时不会引用）
/// <reference path="./api.js" />

/** 
 * @type {HTMLInputElement} 
*/
const loginAccount = utils.find(".login_account");
/** 
 * @type {HTMLInputElement} 
*/
const loginPassword = utils.find(".login_password");
/** 
 * @type {HTMLInputElement} 
*/
const registerAccount = utils.find(".register_account");
/** 
 * @type {HTMLInputElement} 
*/
const registerPassword = utils.find(".register_password");
/** 
 * @type {HTMLInputElement} 
*/
const registerName = utils.find(".register_name");

/** 点击登录 */
async function clickLogin() {
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

/** 点击注册 */
async function clickRegister() {
  const res = await api.register({
    account: registerAccount.value,
    password: registerPassword.value,
    name: registerName.value
  });
  if (res.code === 1) {
    console.log("register", res);
    loginAccount.value = registerAccount.value;
    loginPassword.value = registerPassword.value;
    resetRegister();
    utils.message.success("注册成功");
  }
}

/** 重置注册信息 */
function resetRegister() {
  registerAccount.value = "";
  registerPassword.value = "";
  registerName.value = "";
}
