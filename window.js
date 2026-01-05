const { BrowserWindow } = require("electron");
const path = require("path");
const fs = require("fs");
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
        contextIsolation: options.webPreferences?.contextIsolation ?? true,
        webSecurity: options.webPreferences?.webSecurity ?? false,
        // Hier können weitere Standard-Web-Optionen rein:
        ...(options?.webPreferences ?? null)
      }
    });

    Window.#allWindows.push(this);

    this.on("closed", () => {
      Window.#allWindows = Window.#allWindows.filter((win) => win !== this);
    });
  }
  attachHTML(index) {
    // Pfad zum Ordner oder der Datei
    let basePath = path.join(__dirname, "renderer", index);
    let finalScriptPath;

    // Prüfen, ob es ein Ordner ist -> dann index.js anhängen
    if (fs.existsSync(basePath) && fs.lstatSync(basePath).isDirectory()) {
      finalScriptPath = path.join(basePath, "index.js");
    } else {
      // Sonst annehmen, dass es eine .js Datei ist
      finalScriptPath = basePath.endsWith(".js") ? basePath : basePath + ".js";
    }

    const fileUrl = `file://${finalScriptPath.replace(/\\/g, "/")}`;
    const htmlContent = `<html><head><script src="${fileUrl}" defer></script></head><body></body></html>`;

    this.loadURL(
      `data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`
    );
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
