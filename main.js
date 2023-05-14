const { app, BrowserWindow, ipcMain, Menu, shell, dialog } = require("electron");
const utils = require('./utils');
const constants = require('./constants');
const path = require("path");
const fs = require('fs');

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      backgroundColor: 'black',
      preload: path.join(__dirname, "preload.js")
    }
  });

  const menu = Menu.buildFromTemplate([
    {
      label: app.name,
      submenu: [
        {
          role: 'quit',
        },
      ]
    },
    {
      role: 'windowMenu',
    },
    {
      label: 'Information',
      submenu: [
        {
          label: 'Help',
          click: async () => {
            await shell.openExternal(constants.webHelpPageUrl)
          }
        },
      ]
    }
  ])
  Menu.setApplicationMenu(menu)

  // メインプロセスで `getFilePaths` イベントを受け取ったら、フォルダ内のファイルパスを取得してレンダラープロセスに返す
  ipcMain.handle('selectDirectory', async (event, path) => {
    const selectedDirectories = await dialog.showOpenDialog({
      defaultPath: path || constants.steamPath,
      properties: ['openDirectory']
    });
    if (!selectedDirectories) {
      return;
    }
    event.returnValue = selectedDirectories[0];
  });

  mainWindow.loadFile("index.html");

  // devtoolsを開く
  console.log({
    env: process.env.NODE_ENV
  })
  mainWindow.webContents.openDevTools();
};

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  ipcMain.handle("test", () => {
    console.log('test');
  });
});

app.on("window-all-closed", () => {
  app.quit();
});
