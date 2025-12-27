const { app, BaseWindow } = require("electron");
const ws = require("./load_windowsettings");
app.on("ready", () => {
  const win = new BaseWindow({
    width: ws.windowsettings().lastwidth,
    height: ws.windowsettings().lastheight,
  });
  win.on("close", () => {
    ws.changewindowsettings({
      lastwidth: win.getSize()[0],
      lastheight: win.getSize()[1],
    });
  });
});
