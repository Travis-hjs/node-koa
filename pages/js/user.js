/**
 * 注册
 * @param {object} info 注册传参
 * @param {string} info.account 账户
 * @param {string} info.password 密码 
 * @param {string} info.name 用户名 
 * @param {Function} success
 * @param {Function} fail
 */
function register(info, success, fail) {
    baseRequest('POST', '/register', info, res => {
        if (res.code == 200) {
            if (typeof success === 'function') success(res);
        } else {
            if (typeof fail === 'function') fail(res);
        }
    }, err => {
        if (typeof fail === 'function') fail(err);
    });
}

/**
 * 登录
 * @param {object} info 注册传参
 * @param {string} info.account 账户
 * @param {string} info.password 密码 
 * @param {Function} success
 * @param {Function} fail
 */
function login(info, success, fail) {
    baseRequest('POST', '/login', info, res => {
        if (res.code == 200) {
            if (typeof success === 'function') success(res);
        } else {
            if (typeof fail === 'function') fail(res);
        }
    }, err => {
        if (typeof fail === 'function') fail(err);
    });
}

const loginAccount = document.getElementById('login_account');
const loginPassword = document.getElementById('login_password');

const registerAccount = document.getElementById('register_account');
const registerPassword = document.getElementById('register_password');
const registerName = document.getElementById('register_name');

/** 点击登录 */
function subLogin() {
     login({
         account: loginAccount.value,
         password: loginPassword.value
     }, res => {
        console.log('登录成功', res);
        saveData('userInfo', res.result);
        // window.location.href = 'index.html';
     }, err => {
        console.log('登录失败', err);
        alert(err.message);
     });
}

/** 点击注册 */
function subRegister() {
    register({
        account: registerAccount.value,
        password: registerPassword.value,
        name: registerName.value
    }, res => {
        console.log('register', res);
        loginAccount.value = registerAccount.value;
        loginPassword.value = registerPassword.value;
        resetRegister();
        alert('注册成功');
    }, err => {
        console.log('注册失败', err);
        alert(err.message);
    });
}

/** 重置注册信息 */
function resetRegister() {
    registerAccount.value = '';
    registerPassword.value = '';
    registerName.value = '';
}