const { BrowserWindow } = require("electron");
const path = require("path");
class Window extends BrowserWindow {
  static #allWindows = [];
  /**
   * @returns {Window} Returns a Window-Objecz
   * @param {object} options Startoptions for the Window
   */
  constructor(options) {
    super({
      ...options,
      webPreferences: {
        nodeIntegration: options.webPreferences?.nodeIntegration ?? true,
        contextIsolation: options.webPreferences?.contextIsolation ?? false,
        // Hier können weitere Standard-Web-Optionen rein:
        ...(options?.webPreferences ?? null),
      },
    });

    Window.#allWindows.push(this);

    this.on("closed", () => {
      Window.#allWindows = Window.#allWindows.filter((win) => win !== this);
    });
  }
  attachHTML(index) {
    this.webContents.loadURL(`data:text/html,<html><body></body></html>`);
    if (index) {
      this.webContents.on("did-finish-load", () => {
        this.webContents.executeJavaScript(
          "require('" + path.resolve(index).replace(/\\/g, "/") + "')"
        );
      });
    }
  }
  /**
   * @returns {Array} All Windows in an Array
   */
  static getWindows() {
    return Window.#allWindows;
  }
  /**
   * @returns {number} The Amount of Windows that are Currently opened
   */
  static getCount() {
    return Window.#allWindows.length;
  }
}
module.exports = Window;
