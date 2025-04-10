export interface ScriptItem {
  type: ScriptType;
  script?: string;
  delay?: number;
  selector?: string;
  timeout?: number;
  key?: string | number;
}

export type ScriptType =
  | "script"
  | "delay"
  | "waitForSelector"
  | "click"
  | "fill"
  | "type"
  | "press"
  | "hover"
  | "screenshot"
  | "evaluate"
  | "waitForLoadState"
  | "selectOption"
  | "checkOrUncheck"
  | "goBack"
  | "goForward"
  | "reload"
  | "getPageUrl";

export const ScriptTypeMap: Record<ScriptType, string> = {
  script: "脚本",
  getPageUrl: "获取页面URL",
  delay: "延迟",
  waitForSelector: "等待选择器",
  click: "点击",
  fill: "填充",
  type: "输入",
  press: "按键",
  hover: "悬停",
  screenshot: "截图",
  evaluate: "执行脚本",
  waitForLoadState: "等待加载状态",
  selectOption: "选择选项",
  checkOrUncheck: "勾选/取消勾选",
  goBack: "后退",
  goForward: "前进",
  reload: "刷新",
};
