import { app, BrowserWindow, ipcMain, Menu, shell, dialog } from "electron";
import { electronApp, is } from "@electron-toolkit/utils";
import constants from "@common/constants";
import path from "path";
import utils from "@common/utils";

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: is.dev ? 1000 : 600,
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      sandbox: false
    }
  });

  const menu = Menu.buildFromTemplate([
    {
      label: app.name,
      submenu: [
        {
          role: "quit"
        }
      ]
    },
    {
      role: "windowMenu"
    },
    {
      label: "Information",
      submenu: [
        {
          label: "Help",
          click: async () => {
            await shell.openExternal(constants.webHelpPageUrl);
          }
        }
      ]
    }
  ]);
  Menu.setApplicationMenu(menu);

  // メインプロセスで `getFilePaths` イベントを受け取ったら、フォルダ内のファイルパスを取得してレンダラープロセスに返す
  ipcMain.handle("selectDir", async (event, path) => {
    const selectedDirs = await dialog.showOpenDialog({
      defaultPath: path || constants.steamPath,
      properties: ["openDirectory"]
    });
    console.log("selectDir", selectedDirs);
    if (!selectedDirs || selectedDirs.cancelled) {
      return "";
    }
    return selectedDirs.filePaths[0];
  });

  mainWindow.loadFile("index.html");

  ipcMain.handle("Localization:start", async (_event, path) => {
    console.log("Localization:start", path);
    if (!path || path === "") {
      return;
    }
    mainWindow.webContents.send("Localization:logging", `${utils.dateTime()}: 開始 in ${path}`);
    await utils.sleep(1000);
    mainWindow.webContents.send("Localization:logging", `${utils.dateTime()}: 開始 in ${path}`);
    await utils.sleep(1000);
    mainWindow.webContents.send("Localization:logging", `${utils.dateTime()}: 開始 in ${path}`);
    await utils.sleep(1000);
    mainWindow.webContents.send("Localization:logging", `${utils.dateTime()}: 開始 in ${path}`);
    await utils.sleep(1000);
    mainWindow.webContents.send("Localization:logging", `${utils.dateTime()}: 開始 in ${path}`);
    await utils.sleep(1000);
    mainWindow.webContents.send("Localization:logging", `${utils.dateTime()}: 開始 in ${path}`);
    await utils.sleep(1000);
    mainWindow.webContents.send("Localization:logging", `${utils.dateTime()}: 開始 in ${path}`);
    await utils.sleep(1000);
    mainWindow.webContents.send("Localization:logging", `${utils.dateTime()}: 開始 in ${path}`);
    await utils.sleep(1000);
    mainWindow.webContents.send("Localization:logging", `${utils.dateTime()}: 開始 in ${path}`);
    await utils.sleep(1000);
    mainWindow.webContents.send("Localization:logging", `${utils.dateTime()}: 開始 in ${path}`);
    await utils.sleep(1000);
    mainWindow.webContents.send("Localization:logging", `${utils.dateTime()}: 開始 in ${path}`);
    await utils.sleep(1000);
    mainWindow.webContents.send("Localization:logging", `${utils.dateTime()}: 開始 in ${path}`);
    await utils.sleep(1000);
    mainWindow.webContents.send("Localization:logging", `${utils.dateTime()}:終了`);
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }

  // devtoolsを開く
  console.log({
    env: process.env.NODE_ENV
  });
  mainWindow.webContents.openDevTools();
};

app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId("com.enoatu");
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
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
