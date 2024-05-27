import { find, message, setGlobal } from "./utils.js";
import { api } from "./api.js";

async function getData() {
  const res = await api.testGet(10)
  if (res.code === 1) {
    console.log("get 成功", res);
    message.success("get 成功");
  }
}

async function postData() {
  const res = await api.testPost({
    name: "Hjs",
    time: new Date().toLocaleString(),
  })
  if (res.code === 1) {
    console.log("post 成功", res);
    message.success("post 成功");
  }
}

/** 获取天气数据 */
async function getWeatherInfo() {
  const codeList = ["440100", "440300", "530100", "440400", "450300", "650100"];
  const code = codeList[Math.floor(Math.random() * codeList.length)];
  const res = await api.getWeather(code)
  if (res.code === 1) {
    console.log("获取天气数据 成功", res);
    outputList(res.result);
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

setGlobal({
  getData,
  postData,
  getWeatherInfo,
});
