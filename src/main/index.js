import { app, BrowserWindow, ipcMain, screen, clipboard } from "electron";
import { electronApp, is } from "@electron-toolkit/utils";
import { uIOhook, UiohookKey } from 'uiohook-napi'
import robotjs from '@jitsi/robotjs';
import { sleep, isMac } from "@/utils";
import path from "path";
import { getSelection } from 'node-selection';
// 検証用
// growi edit
// growi preview
// docker
// vscode
// chrome devtool
//
// ## issue
// ctrl + c でコピーできない
// アイコン右下らへんクリックでアイコンが消えない

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
        console.log('[mousedown]')
        const now = (new Date()).getTime()
        let diffTime = now - store.watchIcon.rendererClickTime;
        if (diffTime < 200) {
          console.log('内部クリック1')
          // |renderer     |now
          // -------------100ms
        } else {
          // |renderer     |now         |renderer
          // -------------100ms--------100ms
          sleep(200).then(() => {
            diffTime = store.watchIcon.rendererClickTime - now;
            console.log("[diffTime]", diffTime);
            if (diffTime > 0 && diffTime < 200) {
              console.log('内部クリック2')
            } else {
              console.log('外部クリック')
              console.log('hide!!!!!!!!!!!!')
              store.icon.hide();
            }
          });
        }

        const { control } = store;
        if (e.button === 1) {
          control.prevPressTime = (new Date()).getTime();
        }
      });
      uIOhook.on("mouseup", async (e) => {
        const { control } = store;
        if (e.button === 1) {
          const { x, y } = e;
          const currentReleaseTime = (new Date()).getTime();

          const prevReleaseX = control.prevReleasePosition.x;
          const prevReleaseY = control.prevReleasePosition.y;
          control.prevReleasePosition = { x, y };
          console.log("[mouseup]", x, y, prevReleaseX, prevReleaseY);
          const mouseDistance = Math.sqrt(Math.pow(x - prevReleaseX, 2) + Math.pow(y - prevReleaseY, 2));

          let previousReleaseTime = control.prevReleaseTime;
          let previousPressTime = control.prevPressTime;
          control.prevReleaseTime = currentReleaseTime;

          if (!store.icon.window.isVisible()) {
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
                await store.icon.show(text);
              }
            }
          }
        }
      });
      // uIOhook.on("click", async (e) => {
      //   const { control } = store;
      //   const diffTime = Math.abs(control.iconClickTime - (new Date()).getTime());
      //   if (diffTime < 100) {
      //     console.log("[click]click!!!!!!!!!", diffTime, control.iconClickTime, (new Date()).getTime())
      //   } else {
      //     console.log("[click]not click!!!!!!!!!", diffTime, control.iconClickTime, (new Date()).getTime());
      //     await store.icon.hide();
      //   }
      // });
      uIOhook.on("wheel", async () => {
      });
      uIOhook.on("keyup", async (e) => {
      });
      uIOhook.on("keydown", async (e) => {
        // copy時にrobotjsで押下していることに注意
        console.log("[keydown]", e.keycode);
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
    isIconSpread: false,
    iconClickTime: 0,
    isFirstSpread: false,
  },
  watchControl: {
    keydownTime: 0,
  },
  watchIcon: {
    rendererClickTime: 0,
    mainClickTime: 0,
  },
  browser: {
    window: null,
    create: function() {
      this.window = new BrowserWindow({
        width: 500,
        height: screen.getPrimaryDisplay().size.height,
        x: screen.getPrimaryDisplay().size.width - 500,
        y: 0,
        webPreferences: {
          nodeIntegration: true,
          preload: (path.join(__dirname, "../preload/browser.js")),
        },
        transparent: false,
        frame: true,
        resizable: true,
        alwaysOnTop: false,
        movable: true,
        show: true,
        focusable: true,
      });
      this.window.loadURL('https://chat.openai.com/?model=text-davinci-002-render-sha');

      this.window.on('ready-to-show', async () => {
        await this.window.webContents.executeJavaScript(`
          (async () => {
            // 1. Mutation Observerを作成し、監視対象の要素を指定
            // const targetElement = document.querySelector('body'); // 監視対象の要素を取得
            // const observerConfig = { childList: true, subtree: true }; // Mutation Observerの設定

            // const observer = new MutationObserver((mutationsList) => {
            //   for (const mutation of mutationsList) {
            //     if (mutation.addedNodes.length > 0) {
            //       // 2. 追加されたノードに対して処理を行う
            //       mutation.addedNodes.forEach((node) => {
            //         if (node instanceof HTMLButtonElement && node.classList.contains('btn') && node.classList.contains('relative') && node.classList.contains('btn-primary')) {
            //           // 3. 特定のクラスを持つ要素が追加された場合にクリックする
            //           node.click();
            //         }
            //       });
            //     }
            //   }
            // });

            // // Mutation Observerを開始
            // observer.observe(targetElement, observerConfig);
            const sleep = (msec) => new Promise(resolve => setTimeout(resolve, msec));
            await sleep(600);
            const modal = document.getElementById('radix-:rt:');
            if (modal) {
              await sleep(200);
            }
            const input = document.getElementById('prompt-textarea');
            input.focus();
            input.value = "名言を１つ教えて";
            await sleep(700);
          })();
        `);
        robotjs.keyTap("space");
        await sleep(10);
        robotjs.keyTap("backspace");
        await sleep(10);
        robotjs.keyTap("tab");
        await sleep(10);
        robotjs.keyTap("enter");
      });
      this.window.webContents.openDevTools()
    },
  },
  icon: {
    window: null,
    create: function() {
      this.window = new BrowserWindow({
        width: ICON_SIZE.WIDTH, // 幅と高さを最小に設定
        height: ICON_SIZE.HEIGHT,
        webPreferences: {
          nodeIntegration: true,
          preload: (path.join(__dirname, "../preload/icon.js")),
        },
        transparent: true,
        frame: false,
        resizable: false,
        alwaysOnTop: true,
        movable: false,
        show: false,
        // skipTaskbar: true,
        // hasShadow: false,
        // type: "panel",
        focusable: true,
      });
      if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
        this.window.loadURL(`${process.env["ELECTRON_RENDERER_URL"]}/icon.html`);
      } else {
        this.window.loadFile(path.join(__dirname, "../renderer/icon.html"));
      }
      this.window.setAlwaysOnTop(true, "floating");

      const d = new BrowserWindow({
        width: 800, // 幅と高さを最小に設定
        height: 800,
        position: { x: 0, y: 0 }, // 画面の左上に表示
        webPreferences: {
          nodeIntegration: true,
          preload: (path.join(__dirname, "../preload/icon.js")),
        },
        // transparent: true,
        // frame: false,
        resizable: true,
        // alwaysOnTop: true,
        movable: true,
        skipTaskbar: false,
        hasShadow: false,
        focusable: true,
        title: "icon",
      });
      //  d.loadFile(path.join(__dirname, "../renderer/icon.html"));
      if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
        d.loadURL(`${process.env["ELECTRON_RENDERER_URL"]}/icon.html`);
      } else {
        d.loadFile(path.join(__dirname, "../renderer/icon.html"));
      }
      d.setAlwaysOnTop(true, "floating");
      d.webContents.openDevTools()
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
    show: async function(text) {
      const { x, y } = store.control.prevReleasePosition;
      console.log("show", x, y);
      const iconSize = 30; // アイコンのサイズ(20px * 20px + margin 5px * 2)
      // this.window.setSize(iconSize, iconSize);
      this.window.webContents.send("ICON_SET_TEXT", text);
      this.window.setPosition(x + 15, y + 15); // 右下にアイコンを表示
      this.window.setVisibleOnAllWorkspaces(true);
      this.window.showInactive();
    },
    hide: async function () {
      if (!this.window.isVisible()) {
        return;
      }
      console.log("hide");
      this.window.hide();
      this.window.webContents.send("ICON_UNSPREAD");
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
function createVariableWatcher(variableName) {
  store.watchControl = cloneStore.watchControl;
  return new Promise((resolve) => {
    console.log("[createVariableWatcher]start");
    const handler = {
      set(obj, prop, value) {
      console.log("[createVariableWatcher]handler")
        console.log(obj, prop, value);
        if (prop === variableName) {
          console.log("[createVariableWatcher]set", value);
          resolve(value); // 変数が変更されたらPromiseを解決
          store.watchControl = cloneStore.watchControl;
        }
        obj[prop] = value;
        return true;
      }
    };

    store.watchControl = new Proxy(store.watchControl, handler);
  });
}

const getSelectedTextByClipboard = async () => {
  const currentClipboardContent = clipboard.readText();
  console.log("origin clipboard text : ", currentClipboardContent);

  let keydownDetecter = createVariableWatcher("keydownTime");
  let isKeydown = await Promise.race([sleep(400), keydownDetecter])
  if (isKeydown) {
    console.log("[getSelectedTextByClipboard]戻す1");
    return "";
  }
  keydownDetecter = createVariableWatcher("keydownTime");
  console.log("do copy");
  // clipboard.clear();
  robotjs.keyToggle("c", "down", isMac ? "command" : "control");
  isKeydown = await Promise.race([sleep(50), keydownDetecter])
  if (isKeydown) {
    console.log(isKeydown);
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

app.on("ready", async() => {
  const start = () => {
    const { main, icon, browser } = store;
    try {
      main.init();
      icon.create();
      browser.create();
    } catch (error) {
      console.error("restart", error.trace, error)
      store = cloneStore;
      start();
    }
  }
  start();
});

function createWatcher() {
  store.watchIcon = cloneStore.watchIcon
  console.log("[createWatcher]start");
  const handler = {
    async set(obj, prop, value) {
      console.log("[createWatcher]watch", prop)
      obj[prop] = value;

      // 全体のクリックした時の時間と、アイコンをクリックした時の時間を記録しておき、
      // アイコンをクリックした際は、window内部のクリック確実となるため、比較する必要がない
      if (prop === 'mainClickTime') {
        sleep(100).then(() => {
          const diffTime = Math.abs(obj.rendererClickTime - (new Date()).getTime());
          console.log("[createWatcher]set", obj.rendererClickTime, obj.mainClickTime, diffTime);
          if (diffTime != 0 && diffTime > 200 && diffTime < 10000000) {
            console.log('hide!!!!!!!!!!!!')
            store.icon.hide();
          }
        });
      }
      return true;
    }
  };

  store.watchIcon = new Proxy(store.watchIcon, handler);
}
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId("com.enoatu");
  // createWindow();
  // createWatcher();
  ipcMain.handle('ICON_CLICK', async (event, arg) => {
    console.log('ICON_CLICK!!!!!!!!', arg);
    const { control, watchIcon } = store;
    control.iconClickTime = (new Date()).getTime();
    watchIcon.rendererClickTime = control.iconClickTime;

    if (store.icon.window.isVisible() && !control.isIconSpread) {// アイコン状態の時
      console.log('spread展開')
      const [winX, winY] = store.icon.window.getPosition();
      const { x, y } = screen.getCursorScreenPoint();
      console.log(x, y)
      console.log("[mousedown]icon click!!!!!!!!!");
      control.isIconSpread = true;
      store.icon.window.webContents.send("ICON_SPREAD");
      await sleep(100);
      store.icon.window.setSize(ICON_SPREAD_SIZE.WIDTH, ICON_SPREAD_SIZE.HEIGHT);
      const newPos = { x: winX - ICON_SPREAD_SIZE.WIDTH, y: winY - ICON_SPREAD_SIZE.HEIGHT};
      if (newPos.x < ICON_SPREAD_SIZE.WIDTH) {
        console.log(1)
        newPos.x = ICON_SPREAD_SIZE.WIDTH/2;
      }
      if (newPos.y < ICON_SPREAD_SIZE.HEIGHT) {
        console.log(2)
        newPos.y = ICON_SPREAD_SIZE.HEIGHT/2;
      }
      if (newPos.x > screen.getPrimaryDisplay().size.width - ICON_SPREAD_SIZE.WIDTH) {
        console.log(3)
        newPos.x = screen.getPrimaryDisplay().size.width - ICON_SPREAD_SIZE.WIDTH/2;
      }
      if (newPos.y > screen.getPrimaryDisplay().size.height - ICON_SPREAD_SIZE.HEIGHT) {
        console.log(4)
        newPos.y = screen.getPrimaryDisplay().size.height - ICON_SPREAD_SIZE.HEIGHT/2;
      }
      store.icon.window.setPosition(newPos.x, newPos.y);
    }
  })
  ipcMain.handle('ICON_BUTTON_CLICK', async (event, {text, data:userText}) => {
    console.log('ICON_BUTTON_CLICK!!!!!!!!', text, userText);
    const escapeText = (t) => {
      return t.replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/"/g, '\\"').replace(/\n/g, "\\n")
    }
    text = escapeText(text);
    userText = escapeText(userText);
    store.browser.window.focus();
    await store.browser.window.webContents.executeJavaScript(`
      (async () => {
        const sleep = (msec) => new Promise(resolve => setTimeout(resolve, msec));
        await sleep(600);
        const modal = document.getElementById('radix-:rt:');
        if (modal) {
          await sleep(200);
        }
        const input = document.getElementById('prompt-textarea');
        input.focus();
        input.value = "${text}" + "\\n\\n\\n" + "${userText}";
        await sleep(700);
      })();
    `);
    robotjs.keyTap("space");
    await sleep(10);
    robotjs.keyTap("backspace");
    await sleep(10);
    robotjs.keyTap("enter");
    await sleep(10);
    robotjs.keyTap("tab");
    await sleep(10);
    robotjs.keyTap("enter");
  });

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

app.on("focus", async () => {
  console.log("focus");
});
// destractor
app.on("will-quit", async () => {
  store.main.isWillQuit = true;
  await sleep(1000);
});
