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
function clickLogin() {
    api.login({
        account: loginAccount.value,
        password: loginPassword.value
    }, res => {
        console.log("登录成功", res);
        saveUserInfo(res.result);
        location.href = "index.html";
    }, err => {
        console.log("登录失败", err);
    });
}

/** 点击注册 */
function clickRegister() {
    api.register({
        account: registerAccount.value,
        password: registerPassword.value,
        name: registerName.value
    }, res => {
        console.log("register", res);
        loginAccount.value = registerAccount.value;
        loginPassword.value = registerPassword.value;
        resetRegister();
        utils.showToast("注册成功");
    }, err => {
        console.log("注册失败", err);
    });
}

/** 重置注册信息 */
function resetRegister() {
    registerAccount.value = "";
    registerPassword.value = "";
    registerName.value = "";
}