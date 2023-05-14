import { electronAPI as toolkit } from "@electron-toolkit/preload";
import { contextBridge, ipcRenderer } from "electron";

const versions = {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
  test: () => ipcRenderer.invoke("test"),
  getFilePaths: () => ipcRenderer.invoke("getFilePaths")
  // 関数だけでなく、変数も公開できます
};

const electronAPI = {
  handleHelpMenu: (callback) => ipcRenderer.on("handleHelpMenu", callback)
};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("electron", toolkit);
    contextBridge.exposeInMainWorld("versions", versions);
    contextBridge.exposeInMainWorld("electronAPI", electronAPI);
  } catch (error) {
    console.error(error);
  }
} else {
  window.electron = electronAPI;
  window.versions = versions;
  window.electronAPI = electronAPI;
}
