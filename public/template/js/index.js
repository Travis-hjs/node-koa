// 类型提示用（运行时不会引用）
/// <reference path="./api.js" />

async function clickGet() {
  const res = await api.testGet(10)
  if (res.code === 1) {
    console.log("get 成功", res);
    utils.showToast("get 成功");
  }
}

async function clickPost() {
  const res = await api.testPost({
    name: "Hjs",
    age: new Date().getFullYear() - 1995,
  })
  if (res.code === 1) {
    console.log("post 成功", res);
    utils.showToast("post 成功");
  }
}

/** 获取天气数据 */
async function getWeatherInfo() {
  const cityList = ["广州", "深圳", "昆明", "珠海"];
  const city = cityList[Math.floor(Math.random() * cityList.length)];
  const res = await api.getWeather(city)
  if (res.code === 1) {
    console.log("获取天气数据 成功", res);
    outputList(res.result.data);
  }
}

/**
 * 输出天气列表
 * @param {{ city: string, ganmao: string, forecast: Array<{ date: string, fengxiang: string, type: string, high: string, low: string }> }} info 
 */
function outputList(info) {
  let html = `
    <h2 style="margin-bottom: 4px;">${info.city} 天气</h2>
    <p style="margin-bottom: 10px;">
      <span style="color: #999; font-size: 14px;">${info.ganmao}</span>
    </p>
    `;
  for (let i = 0; i < info.forecast.length; i++) {
    const forecast = info.forecast[i];
    html += `<p style="margin-bottom: 4px; color: #555">
      <span style="width: 100px;">${forecast.date}</span>
      <span style="width: 80px;">${forecast.fengxiang}</span>
      <span style="width: 80px; color: #01d181;">${forecast.type}</span>
      <span style="color: orange;">最${forecast.high}</span>
      <span style="color: #0099ff;">最${forecast.low}</span>
    </p>`;
  }
  utils.find(".weather_box").innerHTML = html;
}
