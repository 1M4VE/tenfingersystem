const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("mainAPI", {
  load_keyboards: () => ipcRenderer.invoke("load_keyboards"),
  getKeyboardSize: (name) => ipcRenderer.invoke("getKeyboardSize", name),
  getKeyboardKeys: (name) => ipcRenderer.invoke("getKeyboardKeys", name)
});
