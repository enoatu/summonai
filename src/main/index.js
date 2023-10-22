import { app, BrowserWindow, ipcMain, screen, clipboard } from "electron";
import { electronApp, is } from "@electron-toolkit/utils";
import { uIOhook, UiohookKey } from 'uiohook-napi'
import robotjs from '@jitsi/robotjs';
import { sleep, isMac } from "@/utils";
import path from "path";
import { getSelection } from 'node-selection';
const ICON_SIZE = {
  WIDTH: 30,
  HEIGHT: 30,
}
const ICON_SPREAD_SIZE = {
  WIDTH: 300,
  HEIGHT: 300,
}
const store = {
  main: {
    isWillQuit: false,
    init: function() {
      console.log("init");
      uIOhook.on("mousedown", async (e) => {
        const { control } = store;
        if (e.button === 1) {
          control.prevPressTime = (new Date()).getTime();
        }
        const [winX, winY] = store.icon.window.getPosition();
        // カーソルの位置を取得
        const { x, y } = screen.getCursorScreenPoint();
        const statusX = winX - x;
        const statusY = winY - y;
        if (statusX > -ICON_SIZE.WIDTH && statusX < 0 && statusY > -ICON_SIZE.HEIGHT && statusY < 0) {
          console.log("[mousedown]icon click!!!!!!!!!");
          control.isIconSpread = true;
          store.icon.window.webContents.send("ICON_SPREAD");
          store.icon.window.setSize(ICON_SPREAD_SIZE.WIDTH, ICON_SPREAD_SIZE.HEIGHT);
          const newPos = { x: winX - ICON_SPREAD_SIZE.WIDTH/2, y: winY - ICON_SPREAD_SIZE.HEIGHT/2};
          if (newPos.x < ICON_SPREAD_SIZE.WIDTH) {
            newPos.x = ICON_SPREAD_SIZE.WIDTH/2;
          }
          if (newPos.y < ICON_SPREAD_SIZE.HEIGHT) {
            newPos.y = ICON_SPREAD_SIZE.HEIGHT/2;
          }
          if (newPos.x > screen.getPrimaryDisplay().size.width - ICON_SPREAD_SIZE.WIDTH) {
            newPos.x = screen.getPrimaryDisplay().size.width - ICON_SPREAD_SIZE.WIDTH/2;
          }
          if (newPos.y > screen.getPrimaryDisplay().size.height - ICON_SPREAD_SIZE.HEIGHT) {
            newPos.y = screen.getPrimaryDisplay().size.height - ICON_SPREAD_SIZE.HEIGHT/2;
          }
          store.icon.window.setPosition(newPos.x, newPos.y);
          return
        }
        if (!control.isMouseUping) {
          await store.icon.hide();
        }
      });
      uIOhook.on("mouseup", async (e) => {
        const { control } = store;
        if (control.isMouseUping) {
          return;
        }
        control.isMouseUping = true;
        if (e.button === 1) {
          const { x, y } = e;
          const currentReleaseTime = (new Date()).getTime();

          const prevReleaseX = control.prevReleasePosition.x;
          const prevReleaseY = control.prevReleasePosition.y;
          control.prevReleasePosition = { x, y };
          const mouseDistance = Math.sqrt(Math.pow(x - prevReleaseX, 2) + Math.pow(y - prevReleaseY, 2));

          let previousReleaseTime = control.prevReleaseTime;
          let previousPressTime = control.prevPressTime;
          control.prevReleaseTime = currentReleaseTime;

          const isPressed = previousReleaseTime < previousPressTime;
          const pressedTime = currentReleaseTime - previousPressTime;
          const isDoubleClick = currentReleaseTime - previousReleaseTime < 700 && mouseDistance < 10;
          let isSelectedEvent = false;
          if (isPressed && pressedTime > 100 && mouseDistance > 20) {
            console.log("[mouseup]long press");
            isSelectedEvent = true;
          }
          if (previousReleaseTime !== 0 && isDoubleClick) {
            console.log("[mouseup]double click");
            isSelectedEvent = true;
          }
          if (isSelectedEvent) {
            console.log("[mouseup]selected event");
            const text = await getMacSelectedText()
            if (text) {
              console.log("[mouseup]text", text);
              await store.icon.show();
            }
          }
        }
        control.isMouseUping = false;
      });
      uIOhook.on("click", async (e) => {
        const { control } = store;
        console.log("[click]click", e.clicks);
        if (store.icon.window.isVisible()) {
          const [winX, winY] = store.icon.window.getPosition();
          // カーソルの位置を取得
          const { x, y } = screen.getCursorScreenPoint();
          const statusX = winX - x;
          const statusY = winY - y;
          if (!control.isIconSpread) {
            if (statusX > -ICON_SIZE.WIDTH && statusX < 0 && statusY > -ICON_SIZE.HEIGHT && statusY < 0) {
              console.log("[click]click!!!!!!!!!");
              return;
            }
            await store.icon.hide();
            console.log("[click]hide icon");
          // }
          } else {
            // 展開中
            if (statusX > -ICON_SPREAD_SIZE.WIDTH && statusX < 0 && statusY > -ICON_SPREAD_SIZE.HEIGHT && statusY < 0) {
              return;
            }
            await store.icon.hide();
            console.log("[click]hide icon");
          }
        }
      });
      uIOhook.on("wheel", async () => {
          // store.icon.hide();
          // console.log("wheel => hide");
      });
      uIOhook.on("keyup", async (e) => {
      });
      uIOhook.on("keydown", async (e) => {
        const { control } = store;
        control.keydownTime = (new Date()).getTime();
        console.log("[keydown]", control.keydownTime);
      });
      uIOhook.start();

      // 以下の対策のために確認するようにする
      // hook_event_proc [990]: CGEventTap timeout!
    },
  },
  control: {
    prevPressTime: 0,
    prevReleaseTime: 0,
    prevReleasePosition: { x: 0, y: 0 },
    isMouseUping: false,
    isIconSpread: false,
    keydownTime: 0,
  },
  icon: {
    window: null,
    create: function() {
      this.window = new BrowserWindow({
        width: ICON_SIZE.WIDTH, // 幅と高さを最小に設定
        height: ICON_SIZE.HEIGHT,
        position: { x: 0, y: 0 }, // 画面の左上に表示
        webPreferences: {
          nodeIntegration: true,
          preload: (path.join(__dirname, "../preload/index.js")),
        },
        transparent: true,
        frame: false,
        resizable: false,
        alwaysOnTop: true,
        movable: false,
        // skipTaskbar: true,
        // hasShadow: false,
        // type: "panel",
        focusable: true,
      });
     if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
       this.window.loadURL(process.env["ELECTRON_RENDERER_URL"]);
     } else {
        this.window.loadFile(path.join(__dirname, "../renderer/index.html"));
     }
     this.window.setAlwaysOnTop(true, "floating");
     //  // this.window.setIgnoreMouseEvents(true);

      // const d = new BrowserWindow({
      //   width: 800, // 幅と高さを最小に設定
      //   height: 800,
      //   position: { x: 0, y: 0 }, // 画面の左上に表示
      //   webPreferences: {
      //     nodeIntegration: true,
      //     preload: (path.join(__dirname, "../preload/index.js")),
      //   },
      //   // transparent: true,
      //   // frame: false,
      //   resizable: true,
      //   // alwaysOnTop: true,
      //   movable: true,
      //   skipTaskbar: false,
      //   hasShadow: false,
      //   focusable: true,
      // });
      // //  d.loadFile(path.join(__dirname, "../renderer/icon.html"));
      // if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
      //   d.loadURL(process.env["ELECTRON_RENDERER_URL"]);
      // } else {
      //   d.loadFile(path.join(__dirname, "../renderer/icon.html"));
      // }
      // d.setAlwaysOnTop(true, "floating");
      // d.webContents.openDevTools()
      //
      // 必要なときにウィンドウを表示
      // 例: マウスの右クリックなどのアクションで表示する
      // この部分は必要なアクションに合わせてカスタマイズ
      // icon.window.webContents.on('context-menu', showIcon);
      // アイコンが不要なときにウィンドウを非表示
      // 例: ウィンドウ外をクリックなどで非表示にする
      // この部分も必要なアクションに合わせてカスタマイズ
      // this.window.on('blur', () => this.hide());
      // clickで消える
      // store.icon.window.on('focus', () => console.log('click') || store.isIconWindowVisible && store.icon.window.hide());
    },
    show: async function() {
      if (this.window.isVisible()) {
        return;
      }
      const { x, y } = screen.getCursorScreenPoint();
      console.log("show", x, y);
      const iconSize = 30; // アイコンのサイズ(20px * 20px + margin 5px * 2)
      // this.window.setSize(iconSize, iconSize);
      this.window.setPosition(x + 15, y + 15); // 右下にアイコンを表示
      this.window.setVisibleOnAllWorkspaces(true);
      this.window.showInactive();
    },
    hide: async function () {
      if (!this.window.isVisible()) {
        return;
      }
      const iconSize = 0; // アイコンのサイズ
      this.window.hide();
      this.window.webContents.send("ICON_UNSPREAD");
      //  this.window.setSize(iconSize, iconSize);
      //  this.window.setPosition(0, 0); // 右下にアイコンを表示
    },
  }
}
const cloneStore = JSON.parse(JSON.stringify(store));

const getMacSelectedText = async () => {
  let text = "";
  try {
    const selection = await getSelection();
    if (selection.text && replaceBlank(selection.text).length > 0) {
      text = selection.text;
    }
    console.log('getSection Success');
  } catch (error) {
    console.log('getSection Failed');
    // releaseKeys();
    text = await getSelectedTextByClipboard();
    console.log('getSelectedTextByClipboard Text=', text);
  }
  return text;
}
function createVariableWatcher(target, variableName) {
  return new Promise((resolve) => {
    const handler = {
      set(obj, prop, value) {
        console.log(obj, prop, value);
        if (prop === variableName) {
          console.log("[createVariableWatcher]set", value);
          resolve(value); // 変数が変更されたらPromiseを解決
        }
        obj[prop] = value;
        return true;
      }
    };

    new Proxy(target, handler);
  });
}

const getSelectedTextByClipboard = async () => {
  const currentClipboardContent = clipboard.readText();
  console.log("origin clipboard text : ", currentClipboardContent);
  clipboard.clear();

  let keydownDetecter = createVariableWatcher(store.control, "keydownTime");
  let isKeydown = await Promise.race([sleep(400), keydownDetecter])
  if (isKeydown) {
    console.log("[getSelectedTextByClipboard]戻す1");
    return "";
  }
  keydownDetecter = createVariableWatcher(store.control, "keydownTime");
  console.log("do copy");
  robotjs.keyToggle("c", "down", isMac ? "command" : "control");
  isKeydown = await Promise.race([sleep(100), keydownDetecter])
  if (isKeydown) {
    clipboard.writeText(currentClipboardContent);
    console.log("[getSelectedTextByClipboard]戻す2");
    return "";
  }
  robotjs.keyToggle("c", "up", isMac ? "command" : "control");
  const selectedText = clipboard.readText();
  console.log("new clipboard text : ", selectedText);
  clipboard.writeText(currentClipboardContent);
  return selectedText;
}

// キーが離される
const releaseKeys = () => {
  uIOhook.keyToggle(UiohookKey.Ctrl, "up");
  uIOhook.keyToggle(UiohookKey.CtrlRight, "up");
  uIOhook.keyToggle(UiohookKey.Alt, "up");
  uIOhook.keyToggle(UiohookKey.AltRight, "up");
  uIOhook.keyToggle(UiohookKey.Shift, "up");
  uIOhook.keyToggle(UiohookKey.ShiftRight, "up");
  uIOhook.keyToggle(UiohookKey.Space, "up");
  uIOhook.keyToggle(UiohookKey.Meta, "up");
  uIOhook.keyToggle(UiohookKey.MetaRight, "up");
  uIOhook.keyToggle(UiohookKey.Tab, "up");
  uIOhook.keyToggle(UiohookKey.Escape, "up");
}

const releaseKeysForShortSelect = () => {
  uIOhook.keyToggle(UiohookKey.Ctrl, "up");
  uIOhook.keyToggle(UiohookKey.CtrlRight, "up");
  uIOhook.keyToggle(UiohookKey.Alt, "up");
  uIOhook.keyToggle(UiohookKey.AltRight, "up");
  uIOhook.keyToggle(UiohookKey.Shift, "up");
  uIOhook.keyToggle(UiohookKey.ShiftRight, "up");
  uIOhook.keyToggle(UiohookKey.Space, "up");
  uIOhook.keyToggle(UiohookKey.Meta, "up");
  uIOhook.keyToggle(UiohookKey.MetaRight, "up");
  uIOhook.keyToggle(UiohookKey.Tab, "up");
  uIOhook.keyToggle(UiohookKey.Escape, "up");
}

// 文字列をクリップボードにコピーする
app.on("ready", async() => {
  const start = () => {
    const { main, icon } = store;
    try {
      main.init();
      icon.create();
    } catch (error) {
      console.error("restart", error.trace, error)
      store = cloneStore;
      start();
    }
  }
  start();
});
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId("com.enoatu");
  // createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      // createWindow();
    }
  });

  ipcMain.handle("test", () => {
    console.log("test");
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
// destractor
app.on("will-quit", async () => {
  store.main.isWillQuit = true;
  await sleep(1000);
});
