import { app, BrowserWindow, ipcMain, Menu, shell, dialog } from "electron";
import { electronApp, is } from "@electron-toolkit/utils";
import constants from "@common/constants";
import path from "path";

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
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
  ipcMain.handle("selectDirectory", async (event, path) => {
    const selectedDirectories = await dialog.showOpenDialog({
      defaultPath: path || constants.steamPath,
      properties: ["openDirectory"]
    });
    if (!selectedDirectories) {
      return;
    }
    event.returnValue = selectedDirectories[0];
  });

  mainWindow.loadFile("index.html");

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
  electronApp.setAppUserModelId("com.electron");
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
