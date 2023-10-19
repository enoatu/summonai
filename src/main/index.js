import { app, globalShortcut, BrowserWindow, ipcMain, Menu, shell, dialog, screen, clipboard } from "electron";
import { electronApp } from "@electron-toolkit/utils";
import { uIOhook, UiohookKey } from 'uiohook-napi'
import robotjs from '@jitsi/robotjs';
import { sleep, isMac } from "@/utils";
import { getSelection } from 'node-selection';

// // スウィフトコードを実行
// const swiftProcess = spawn('swift', [path.join(__dirname, '../..//select_text.swift')]);
//
// swiftProcess.stdout.on('data', (data) => {
//   // Swiftコードからの出力を処理
//   const selectedText = data.toString();
//   console.log(`Selected Text: ${selectedText}`);
// });
//
// swiftProcess.stderr.on('data', (data) => {
//   console.error(`Error: ${data}`);
// });
//
// swiftProcess.on('close', (code) => {
//   if (code === 0) {
//     console.log('Swift process finished successfully.');
//   } else {
//     console.error(`Swift process exited with code ${code}`);
//   }
// });

// app.on("ready", () => {
//   // グローバルショートカットを設定（例: Ctrl+Shift+C）
//   globalShortcut.register('Command+Control+C', () => {
//     // コピー
//     const script = `
//     -- アクティブなアプリケーションの名称を取得
//     tell application "System Events"
//         keystroke "c" using {command down}
//     end tell
//     `
//     exec(`osascript -e '${script}'`, (error, stdout, stderr) => {
//       if (error) {
//         console.error(`Error: ${error.message}`);
//         return;
//       }
//     });
//
//     // アクセシビリティAPIを使用して選択しているテキストを取得
//     const selectedText = clipboard.readText('selection');
//     console.log('選択したテキスト:', selectedText);
//
//   });
// });
// 選択したテキストをクリップボードにコピー
//  const script = `
//tell application "System Events"
//   set frontApp to name of first application process whose frontmost is true
//end tell
//
//set targetApps to {"Google Chrome"}
//set jsScript to "return window.getSelection().toString();"
//
//if frontApp is in targetApps then
//    tell application frontApp
//        set selectedText to execute javascript jsScript in front window
//        if selectedText is not "" then
//            set filePath to "/tmp/selected_text.txt"
//            do shell script "echo " & quoted form of selectedText & " > " & filePath
//        end if
//    end tell
//else
//    display dialog "このアプリケーションではサポートされていません。"
//end if
//`
//  exec(`osascript -e '${script}'`, (error, stdout, stderr) => {
//    if (error) {
//      console.error(`Error: ${error.message}`);
//      return;
//    }
//  });
    //
    // const cursorPosition = screen.getCursorScreenPoint();
    // const iconSize = { width: 5, height: 2 }; // 2cm * 2cm

    // const icon.window = new BrowserWindow({
    //   width: iconSize.width,
    //   height: iconSize.height,
    //   frame: true, // ウィンドウフレームを非表示に
    //   transparent: false, // 背景を透明に
    //   alwaysOnTop: true, // 常に最前面に表示
    //   webPreferences: {
    //     nodeIntegration: true,
    //   },
    // });

    // icon.window.setPosition(cursorPosition.x, cursorPosition.y);
    // icon.window.loadFile('src/icon/index.html');
//   });
// });

const store = {
  main: {
    isWillQuit: false,
    init: function() {
      console.log("init");
      uIOhook.on("mousedown", async (e) => {
        if (e.button === 1) {
          store.control.prevPressTime = (new Date()).getTime();
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
          const mouseDistance = Math.sqrt(Math.pow(x - prevReleaseX, 2) + Math.pow(y - prevReleaseY, 2));

          let previousReleaseTime = control.prevReleaseTime;
          let previousPressTime = control.prevPressTime;
          control.prevReleaseTime = currentReleaseTime;

          const isPressed = previousReleaseTime < previousPressTime;
          const pressedTime = currentReleaseTime - previousPressTime;
          const isDoubleClick = currentReleaseTime - previousReleaseTime < 700 && mouseDistance < 10;
          let isSelectedEvent = false;
          if (isPressed && pressedTime > 300 && mouseDistance > 20) {
            isSelectedEvent = true;
          }
          if (previousReleaseTime !== 0 && isDoubleClick) {
            isSelectedEvent = true;
          }
          if (isSelectedEvent) {
            getMacSelectedText().then(text => {
              if (text) {
                console.log("text", text);
                store.icon.show();
              }
            }).catch(error => {
              console.error("errorだ", error);
            });
            return;
          }
        }
      });
      uIOhook.on("click", async (e) => {
        console.log("click", e.clicks);
        if (store.icon.window.isVisible()) {
          const [winX, winY] = store.icon.window.getPosition();
          // カーソルの位置を取得
          const { x, y } = screen.getCursorScreenPoint();
          const statusX = winX - x;
          const statusY = winY - y;
          if (statusX > 0 && statusX < 20 && statusY > 0 && statusY < 20) {
            console.log("click!!!!!!!!!");
            return;
          }
          if (statusX > 5 || statusY > 5 || statusX < -5 || statusY < -5) {
            store.icon.hide();
            console.log("hide icon");
          }
        }
      });
      uIOhook.on("wheel", async () => {
          // store.icon.hide();
          // console.log("wheel => hide");
      });
      uIOhook.on("keyup", async (e) => {
        // store.icon.hide();
        // console.log("keyup => hide");
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
  },
  icon: {
    window: null,
    create: function() {
      this.window = new BrowserWindow({
        width: 30, // 幅と高さを最小に設定
        height: 30,
        position: { x: 0, y: 0 }, // 画面の左上に表示
        webPreferences: {
          nodeIntegration: true,
        },
        transparent: false,
        frame: false,
        resizable: false,
        alwaysOnTop: true,
        movable: false,
        // skipTaskbar: true,
        // hasShadow: false,
        // type: "panel",
        // focusable: false,
      });
      this.window.loadFile('src/icon/index.html');
      this.window.setIgnoreMouseEvents(true);
      this.window.setAlwaysOnTop(true, "floating");
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
      await (async () => {
        if (this.window.isVisible()) {
          return;
        }
        const { x, y } = screen.getCursorScreenPoint();
        const iconSize = 30; // アイコンのサイズ(20px * 20px + margin 5px * 2)
        // this.window.setSize(iconSize, iconSize);
        this.window.setPosition(x + 15, y + 15); // 右下にアイコンを表示
        this.window.show();
      })();
    },
    hide: async function () {
      await (async () => {
        if (!this.window.isVisible()) {
          return;
        }
        const iconSize = 0; // アイコンのサイズ
        this.window.hide();
       //  this.window.setSize(iconSize, iconSize);
       //  this.window.setPosition(0, 0); // 右下にアイコンを表示
      })();
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
    releaseKeys();
    text = await getSelectedTextByClipboard();
    console.log('getSelectedTextByClipboard Text=', text);
  }
  return text;
}

const getSelectedTextByClipboard = async () => {
  const currentClipboardContent = clipboard.readText();
  console.log("origin clipboard text : ", currentClipboardContent);
  clipboard.clear();
  await sleep(10)
  console.log("do copy");
  robotjs.keyToggle("c", "down", isMac ? "command" : "control");
  await sleep(10)
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

// 文字列をクリップボードにコピーする
app.on("ready", async() => {
  const start = () => {
    const { main, icon } = store;
    try {
      main.init();
      icon.create();
    } catch (error) {
      console.error("restart", error.trace)
      store = cloneStore;
      start();
    }
  }
  start();
  // const interval = setInterval(async() => {
  //   console.log(store)
  //   if (store.main.isWillQuit) {
  //     clearInterval(interval);
  //     return;
  //   }
  //   try {
  //     const { text, process } = await getSelection();
  //     console.log('current selection:', { text, process });
  //     icon.show();
  //   } catch (error) {
  //     console.error('error', error);
  //   }
  // }, 1000);
});

// const createWindow = () => {
//   const mainWindow = new BrowserWindow({
//     width: 800,
//     height: is.dev ? 1000 : 600,
//     webPreferences: {
//       nodeIntegration: true,
//       preload: path.join(__dirname, "../preload/index.js"),
//       sandbox: false
//     }
//   });
//
//   const menu = Menu.buildFromTemplate([
//     {
//       label: app.name,
//       submenu: [
//         {
//           role: "quit"
//         }
//       ]
//     },
//     {
//       role: "windowMenu"
//     },
//     {
//       label: "Information",
//       submenu: [
//         {
//           label: "Help",
//           click: async () => {
//             await shell.openExternal(constants.webHelpPageUrl);
//           }
//         }
//       ]
//     }
//   ]);
//   Menu.setApplicationMenu(menu);
//
// //   // メインプロセスで `getFilePaths` イベントを受け取ったら、フォルダ内のファイルパスを取得してレンダラープロセスに返す
// //   ipcMain.handle("selectDir", async (event, path) => {
// //     const selectedDirs = await dialog.showOpenDialog({
// //       defaultPath: path || constants.steamPath,
// //       properties: ["openDirectory"]
// //     });
// //     console.log("selectDir", selectedDirs);
// //     if (!selectedDirs || selectedDirs.cancelled) {
// //       return "";
// //     }
// //     return selectedDirs.filePaths[0];
// //   });
// //
// //   mainWindow.loadFile("index.html");
// //
// //  // カスタムUI内のアイコンをクリックしたときのアクション
// //     mainWindow.webContents.on('did-finish-load', () => {
// //         mainWindow.webContents.executeJavaScript(`
// //             const icon = document.getElementById('icon');
// //             icon.addEventListener('click', () => {
// //                 const selectedText = window.getSelection().toString();
// //                 if (selectedText) {
// //                     clipboard.writeText(selectedText);
// //                 }
// //             });
// //         `);
// //     });
//
// //   const script = `
// // -- アクティブなアプリケーションの名称を取得
// // tell application "System Events"
// //     set frontApp to name of first application process whose frontmost is true
// // end tell
// //
// // -- 対象のアプリケーションのリストを定義
// // set targetApps to {"Google Chrome", "Safari"} -- 対象のアプリケーションを追加
// //
// // -- アクティブなアプリケーションが対象のアプリケーションかを確認
// // if frontApp is in targetApps then
// //     -- 選択テキストを取得
// //     tell application "System Events"
// //         tell process frontApp
// //             -- 選択テキストの取得方法をアプリケーションごとに調整
// //             set selectedText to value of attribute "AXSelectedText" of text area 1 of front window
// //         end tell
// //     end tell
// //
// //     -- 選択テキストが空でない場合、ファイルに書き込む
// //     if selectedText is not "" then
// //         set filePath to "/tmp/selected_text.txt"
// //         do shell script "echo " & quoted form of selectedText & " > " & filePath
// //     end if
// // else
// //     display dialog "このアプリケーションではサポートされていません。"
// // end if
// //   `
// /*
// const script = `
// -- 選択テキストの変更を監視する関数
// on checkSelectionChange()
//     tell application "System Events"
//         set frontApp to name of first application process whose frontmost is true
//         -- AXSelectedTextの値を取得
//         set selectedTextValue to (value of attribute "AXSelectedText" of window 1 of process frontApp)
//         set currentSelection to (selectedTextValue as string)
//     end tell
//
//     -- 選択テキストが変更されたら何らかのアクションを実行
//     if currentSelection is not previousSelection then
//         -- ここに選択テキストが変更されたときのアクションを追加
//         -- 例: ログに記録する、通知を表示する、ファイルに書き出すなど
//         do shell script "echo " & quoted form of currentSelection & " > /tmp/selected_text.txt"
//         set previousSelection to currentSelection
//     end if
// end checkSelectionChange
//
// -- 初期値の設定
// set previousSelection to ""
//
// -- 選択テキストの変更を監視
// repeat
//     checkSelectionChange()
//     delay 1 -- 監視間隔を調整（必要に応じて変更）
// end repeat
// `
//
//   exec(`osascript -e '${script}'`, (error, stdout, stderr) => {
//     if (error) {
//       console.error(`Error: ${error.message}`);
//       return;
//     }
//   });
//     */
//   const filePath = '/tmp/selected_text.txt';
//   const watcher = fs.watch(filePath, (event, filename) => {
//     if (event === 'change') {
//       fs.readFile(filePath, 'utf8', (err, data) => {
//         if (!err) {
//           // ファイルが変更されたときの処理
//           console.log(data);
//
//           // ここで選択したテキストに対するアクションを実行できます
//         }
//       });
//     }
//   });
//   app.on('before-quit', () => {
//       watcher.close();
//   });
//   // HMR for renderer base on electron-vite cli.
//   // Load the remote URL for development or the local html file for production.
//   if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
//     mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
//   } else {
//     mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
//   }
//
//   // devtoolsを開く
//   console.log({
//     env: process.env.NODE_ENV
//   });
//   mainWindow.webContents.openDevTools();
// };

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
