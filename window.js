const { BrowserWindow } = require("electron");
const path = require("path");
const fs = require("fs");

class Window extends BrowserWindow {
  static #allWindows = [];
  #enableMaxAspectRatio = false;
  #enableMinAspectRatio = false;
  #minRatio = 1.0;
  #maxRatio = 16 / 9;

  constructor(
    /**
     *@typedef options
     *@property {boolean} [enableMaxAspectRatio = false] Enables the Characteristic, that prevents the @type {Window} to be resize above the maximum aspect ratio
     */ options
  ) {
    const {
      enableMaxAspectRatio = false,
      enableMinAspectRatio = false,
      webPreferences,
      ...restOptions
    } = options;

    super({
      ...restOptions,
      webPreferences: {
        nodeIntegration: webPreferences?.nodeIntegration ?? true,
        contextIsolation: webPreferences?.contextIsolation ?? true,
        webSecurity: webPreferences?.webSecurity ?? false,
        ...webPreferences
      }
    });

    this.#enableMaxAspectRatio = enableMaxAspectRatio;
    this.#enableMinAspectRatio = enableMinAspectRatio;

    Window.#allWindows.push(this);

    this.on("resize", () => {
      const [width, height] = this.getSize();

      // Wir berechnen die erlaubten Grenzen basierend auf der aktuellen Höhe/Breite
      let minW = 0,
        maxW = 99999,
        minH = 0,
        maxH = 99999;

      // 1. Wenn Max-Ratio (16:9) aktiv ist:
      if (this.#enableMaxAspectRatio) {
        // Die Breite darf maximal Höhe * 1.77 sein
        maxW = Math.round(height * this.#maxRatio);
        // Die Höhe darf minimal Breite / 1.77 sein
        minH = Math.round(width / this.#maxRatio);
      }

      // 2. Wenn Min-Ratio (1:1) aktiv ist:
      if (this.#enableMinAspectRatio) {
        // Die Breite muss mindestens so groß wie die Höhe sein
        minW = Math.round(height * this.#minRatio);
        // Die Höhe darf maximal so groß wie die Breite sein
        maxH = Math.round(width / this.#minRatio);
      }

      // Wir setzen die Limits. Das Betriebssystem stoppt die Maus nun "hart" an diesen Werten.
      // WICHTIG: Wir nutzen setMinimumSize und setMaximumSize für die Blockade.
      this.setMinimumSize(minW, minH);
      this.setMaximumSize(maxW, maxH);
    });

    this.on("closed", () => {
      Window.#allWindows = Window.#allWindows.filter((win) => win !== this);
    });
  }

  // ... restliche Methoden (attachHTML, etc.) ...
  attachHTML(index) {
    let basePath = path.join(__dirname, "renderer", index);
    let finalScriptPath;
    if (fs.existsSync(basePath) && fs.lstatSync(basePath).isDirectory()) {
      finalScriptPath = path.join(basePath, "index.js");
    } else {
      finalScriptPath = basePath.endsWith(".js") ? basePath : basePath + ".js";
    }
    const fileUrl = `file://${finalScriptPath.replace(/\\/g, "/")}`;
    const htmlContent = `<html><head><script src="${fileUrl}" defer></script></head><body></body></html>`;
    this.loadURL(
      `data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`
    );
  }
  static getWindows() {
    return Window.#allWindows;
  }
  static getCount() {
    return Window.#allWindows.length;
  }
}

module.exports = Window;
