import { find, message, setGlobal } from "./utils.js";
import { api } from "./api.js";

async function getData() {
  const res = await api.testGet(10)
  if (res.code === 1) {
    console.log("get 成功", res);
    message.success("get 成功");
  }
}

async function getPublicKey() {
  const res = await api.getConfig()
  const key = res.code === 1 ? res.data.key : null;
  if (key) {
    return crypto.subtle.importKey(
      "spki",
      pemToArrayBuffer(key),
      {
        name: "RSA-OAEP",
        hash: "SHA-256",
      },
      false,
      ["encrypt"],
    );
  }
  return key;
}

/**
 *
 * @param {string} pem
 */
function pemToArrayBuffer(pem) {
  const base64 = pem
    .replace("-----BEGIN PUBLIC KEY-----", "")
    .replace("-----END PUBLIC KEY-----", "")
    .replace(/\s+/g, "");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 *
 * @param {ArrayBuffer} buffer
 */
function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * 加密文本
 * @param {string} value
 */
async function encryptText(value) {
  const publicKey = await getPublicKey();
  if (!publicKey) {
    console.log("缺少公钥");
    return "";
  }
  const content = new TextEncoder().encode(value);
  const encrypted = await crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    publicKey,
    content,
  );
  return arrayBufferToBase64(encrypted);
}

async function postData() {
  let encode;
  if (window.crypto && window.crypto.subtle) {
    encode = await encryptText("@test-encode-value.!");
  }
  const res = await api.testPost({
    name: "Hjs",
    time: new Date().toLocaleString(),
    encode,
  })
  if (res.code === 1) {
    console.log("post 成功", res);
  }
}

/** 获取天气数据 */
async function getWeatherInfo() {
  const codeList = ["440100", "440300", "530100", "440400", "450300", "650100"];
  const code = codeList[Math.floor(Math.random() * codeList.length)];
  const res = await api.getWeather(code)
  if (res.code === 1) {
    console.log("获取天气数据 成功", res);
    outputList(res.data);
  }
}

/**
 * 输出天气列表
 * @param {{ lives: Array<{ city: string, province: string, weather: string }> }} info
 */
function outputList(info) {
  const html = `
  <h2 style="margin-bottom: 4px;">${info.lives[0].city}-天气</h2>
  <p style="margin-bottom: 10px;">
    <span style="color: #999; font-size: 14px;">${info.lives[0].weather}</span>
  </p>
  <div contenteditable spellcheck style="padding: 10px; border: solid 1px #eee; outline-color: orange;">${JSON.stringify(info, undefined, 4)}</div>
  `;
  find(".weather_box").innerHTML = html;
}

async function getFile() {
  const res = await api.getFile("video")
  if (res.code === 1) {
    console.log(res.data);
  }
}

setGlobal({
  getData,
  postData,
  getWeatherInfo,
  getFile,
});
