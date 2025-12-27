const { app } = require("electron");
const Window = require("./window.js");
const ws = require("./load_windowsettings.js");
app.on("ready", () => {
  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  });
  const win = new Window({
    width: ws.windowsettings().lastwidth,
    height: ws.windowsettings().lastheight,
  });
  win.attachHTML("index.js");
  win.on("close", () => {
    ws.changewindowsettings({
      lastwidth: win.getSize()[0],
      lastheight: win.getSize()[1],
    });
  });
});
app.on("activate", () => {
  if (Window.getCount() == 0) {
    const win = new Window({
      width: ws.windowsettings().lastwidth,
      height: ws.windowsettings().lastheight,
    });
    win.attachHTML("index.js");
    win.on("close", () => {
      ws.changewindowsettings({
        lastwidth: win.getSize()[0],
        lastheight: win.getSize()[1],
      });
    });
  }
});
