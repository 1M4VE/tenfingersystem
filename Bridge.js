function events() {
  const { ipcMain } = require("electron");
  const Keyboard = require("./Keyboard");
  ipcMain.handle("load_keyboards", async (event) => {
    Keyboard.importKeyboards("./Keyboard");
    console.log("Keyboards succesfully loaded!");
  });
  ipcMain.handle("getKeyboardSize", async (event, name) => {
    return Keyboard.searchKeyboard(name).getSize();
  });
  ipcMain.handle("getKeyboardKeys", async (event, name) => {
    return Keyboard.searchKeyboard(name).getKeys();
  });
}
module.exports = { events };
