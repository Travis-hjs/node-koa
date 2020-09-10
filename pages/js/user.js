import { 
    find, toast 
} from "./utils.js";

import { 
    login, register 
} from "./api.js";

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

/** 点击登录 */
function clickLogin() {
     login({
         account: loginAccount.value,
         password: loginPassword.value
     }, res => {
        console.log("登录成功", res);
        saveUserInfo(res.result);
        window.location.href = "index.html";
     }, err => {
        console.log("登录失败", err);
        toast.showToast(err.message || "登录失败");
     });
}

/** 点击注册 */
function clickRegister() {
    register({
        account: registerAccount.value,
        password: registerPassword.value,
        name: registerName.value
    }, res => {
        console.log("register", res);
        loginAccount.value = registerAccount.value;
        loginPassword.value = registerPassword.value;
        resetRegister();
        toast.showToast("注册成功");
    }, err => {
        console.log("注册失败", err);
        toast.showToast(err.message || "注册失败");
    });
}

/** 重置注册信息 */
function resetRegister() {
    registerAccount.value = "";
    registerPassword.value = "";
    registerName.value = "";
}

find(".btn_login").addEventListener("click", clickLogin);
find(".btn_register").addEventListener("click", clickRegister);
find(".btn_reset").addEventListener("click", resetRegister);