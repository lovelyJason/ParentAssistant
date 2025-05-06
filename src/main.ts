// import { mainView } from './views'
import initial from './init'

toast("运行成功");

if (!floaty.checkPermission()) {
  // 没有悬浮窗权限，提示用户并跳转请求
  toast(
    "本脚本需要悬浮窗权限来显示悬浮窗，请在随后的界面中允许并重新运行本脚本。"
  );
  floaty.requestPermission();
  exit();
} else {
  toastLog("已有悬浮窗权限");
}

initial()

// ui.layout(mainView())