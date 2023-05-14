const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("versions", {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
  test: () => ipcRenderer.invoke("test"),
  getFilePaths: () => ipcRenderer.invoke("getFilePaths")
  // 関数だけでなく、変数も公開できます
});

contextBridge.exposeInMainWorld("electronAPI", {
  handleHelpMenu: (callback) => ipcRenderer.on("handleHelpMenu", callback)
});
