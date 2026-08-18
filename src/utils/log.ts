import fs from "node:fs";
import path from "node:path";
import { formatWithOptions } from "node:util";
import { config } from "./config.js";

const LOG_DIR = path.resolve(config.logFilePath);

function padNumber(value: number) {
  return `${value}`.padStart(2, "0");
}

function getDateParts(date = new Date()) {
  return {
    year: date.getFullYear(),
    month: padNumber(date.getMonth() + 1),
    day: padNumber(date.getDate()),
    hour: padNumber(date.getHours()),
    minute: padNumber(date.getMinutes()),
    second: padNumber(date.getSeconds()),
  };
}

/**
 * 持久化日志打印
 * - 将打印的内容写入到指定目录，每天一个日志文件，命名为 `YYYY-MM-DD.log`
 * @param args 打印参数
 */
function logRecord(...args: Array<any>) {
  const now = new Date();
  const { year, month, day, hour, minute, second } = getDateParts(now);
  const filePath = path.join(LOG_DIR, `${year}-${month}-${day}.log`);
  const prefix = `[${year}-${month}-${day} ${hour}:${minute}:${second}]`;
  const content = formatWithOptions({ colors: false, depth: null }, ...args);

  fs.mkdirSync(LOG_DIR, { recursive: true });
  fs.appendFileSync(filePath, `${prefix} ${content}\n`, "utf8");
}

type LogColor = "red"
  | "red-light"
  | "green"
  | "green-light"
  | "yellow"
  | "yellow-light"
  | "blue"
  | "blue-light"
  | "purple"
  | "purple-light"
  | "cyan"
  | "cyan-light";

/**
 * 控制台打印颜色文字
 * @param text
 * @param color
 */
export function getLogText(text: string, color: LogColor) {
  const map = {
    "red": 31,
    "red-light": 41,
    "green": 92,
    "green-light": 42,
    "yellow": 33,
    "yellow-light": 43,
    "blue": 36,
    "blue-light": 44,
    "purple": 95,
    "purple-light": 45,
    "cyan": 96,
    "cyan-light": 46,
  };
  return `\x1B[${map[color]}m${text}\x1B[0m`;
}

/**
 * 日志打印
 * - 会在日志目录（`config.logFilePath`）中生成文件
 * @param type 打印类型
 * @param title 标题
 * @param arg 参数
 */
export function trackLog(type: "info" | "warn" | "error", title: string, ...arg: Array<any>) {
  let color: LogColor;
  switch (type) {
    case "error":
      color = "red-light";
      break;

    case "warn":
      color = "yellow-light";
      break;

    default:
      color = "blue-light";
      break;
  }
  console.log(getLogText(` ${type}: ${title} `, color), ...arg);
  logRecord(`${type}: ${title}`, ...arg);
}
