// 类型提示用（运行时不会引用）
/// <reference path="./api.js" />

async function clickGet() {
  const res = await api.testGet(10)
  if (res.code === 1) {
    console.log("get 成功", res);
    utils.message.success("get 成功");
  }
}

async function clickPost() {
  const res = await api.testPost({
    name: "Hjs",
    age: new Date().getFullYear() - 1995,
  })
  if (res.code === 1) {
    console.log("post 成功", res);
    utils.message.success("post 成功");
  }
}

/** 获取天气数据 */
async function getWeatherInfo() {
  const cityList = ["广州", "深圳", "昆明", "珠海"];
  const city = cityList[Math.floor(Math.random() * cityList.length)];
  const res = await api.getWeather(city)
  if (res.code === 1) {
    console.log("获取天气数据 成功", res);
    outputList(res.result);
  }
}

/**
 * 输出天气列表
 * @param {{ city: string, week: string} info 
 */
function outputList(info) {
  const html = `
  <h2 style="margin-bottom: 4px;">${info.city} 天气</h2>
  <p style="margin-bottom: 10px;">
    <span style="color: #999; font-size: 14px;">${info.week}</span>
  </p>
  <div contenteditable spellcheck style="padding: 10px; border: solid 1px #eee; outline-color: orange;">${JSON.stringify(info, undefined, 4)}</div>
  `;
  utils.find(".weather_box").innerHTML = html;
}
