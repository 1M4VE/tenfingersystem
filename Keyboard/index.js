const fs = require("fs");
const path = require("path");

class Keyboard {
  #halfRows;
  #halfFieldsInARow;
  #keyboardname;
  #area = {};
  #keys = {};

  static #keyboardObjects = [];

  /**
   * @param {Object} c
   * @param {number} c.rows Defines the amount of 2x2 rows the keyboard has
   * @param {number} c.keysInARow Defines how many keys are in a row
   * @param {String} c.keyboardname Defines the name of the keyboardobject
   */
  constructor(c) {
    this.#halfRows = (c?.rows ?? 3) * 2;
    this.#halfFieldsInARow = (c?.keysInARow ?? 14) * 2;
    this.#keyboardname =
      c?.keyboardname ??
      "New_Keyboard_" + Object.keys(Keyboard.#keyboardObjects).lenght;
    for (let r = 1; r <= this.#halfRows; r++) {
      for (let f = 1; f <= this.#halfFieldsInARow; f++) {
        this.#area[`${r}_${f}`] = { belegt: false, keyId: null };
      }
    }
    Keyboard.#keyboardObjects.push(this);
  }

  /**
   *@param {Object} k The characteristics of the key
   *@param {number} k.fields.lenght The lenght of the Key
   *@param {number} k.fields An array of grid coordinates defining the key's shape
   *@param {Object} k.keyLabel The Labels of the Keys
   *@param {String} k.keyLabel.primary Primary Label
   *@param {String} k.keyLabel.secondary Secondary Label
   *@param {String} k.keyLabel.tertiary Tertiary Label
   *@param {String} k.keyEvent The events of the key labels
   *@param {String} [k.keyEvent.primary = 'a','b']
   */
  createKey(k) {
    if (!k.fields || k.fields.length === 0) {
      throw Object.assign(
        new Error("Key benötigt mindestens ein Feld im Halbraster."),
        { name: "keySizeInvalid" }
      );
    }

    const keyId = Object.keys(this.#keys).length + 1;

    // 1. Validierung: Sind alle Zielfelder im Grid und frei?
    k.fields.forEach((f) => {
      const coord = `${f.r}_${f.f}`;
      if (!this.#area[coord]) {
        throw Object.assign(
          new Error(`Koordinate ${coord} liegt außerhalb des Keyboards.`),
          { name: "keyOutOfBounds" }
        );
      }
      if (this.#area[coord].belegt) {
        throw Object.assign(
          new Error(
            `Koordinate ${coord} ist bereits durch Key ${
              this.#area[coord].keyId
            } belegt.`
          ),
          { name: "keyPositionAlreadyUsed" }
        );
      }
    });

    // 2. Felder im Grid belegen
    k.fields.forEach((f) => {
      const coord = `${f.r}_${f.f}`;
      this.#area[coord].belegt = true;
      this.#area[coord].keyId = keyId;
    });

    // 3. Bounding Box berechnen (für CSS-Grid Positionierung)
    const rows = k.fields.map((f) => f.r);
    const cols = k.fields.map((f) => f.f);
    const minR = Math.min(...rows);
    const maxR = Math.max(...rows);
    const minF = Math.min(...cols);
    const maxF = Math.max(...cols);

    // 4. Key-Objekt speichern
    this.#keys[keyId] = {
      id: keyId,
      keyLabel: {
        primary: k.keyLabel?.primary ?? "",
        secondary: k.keyLabel?.secondary ?? "",
        tertiary: k.keyLabel?.tertiary ?? ""
      },
      keyEvent: {
        primary: k.keyEvent?.primary ?? k.keyLabel?.primary ?? "",
        secondary: k.keyEvent?.secondary ?? k.keyLabel?.secondary ?? "",
        tertiary: k.keyEvent?.tertiary ?? k.keyLabel?.tertiary ?? ""
      },
      fields: k.fields,
      areaSize: k.fields.length, // Fläche in Halbraster-Einheiten
      gridPos: {
        rowStart: minR,
        colStart: minF,
        rowSpan: maxR - minR + 1,
        colSpan: maxF - minF + 1
      }
    };

    return keyId;
  }

  // --- STATISCHE METHODEN ---

  static importKeyboards(directorypath) {
    if (!fs.existsSync(directorypath)) return;

    const files = fs
      .readdirSync(directorypath)
      .filter((f) => f.endsWith("_Keyboard.json"));

    files.forEach((file) => {
      const data = JSON.parse(
        fs.readFileSync(path.join(directorypath, file), "utf8")
      );
      const kb = new Keyboard({
        keyboardname: data.keyboardname,
        rows: data.halfRows / 2,
        keysInARow: data.halfFieldsInARow / 2
      });
      if (data.keys) {
        // In der JSON sind Keys oft ein Objekt oder Array
        const keyList = Array.isArray(data.keys)
          ? data.keys
          : Object.values(data.keys);
        keyList.forEach((k) => kb.createKey(k));
      }
    });
  }

  static searchKeyboard(name) {
    return (
      Keyboard.#keyboardObjects.find((kb) => kb.#keyboardname === name) || false
    );
  }

  static showKeyboards() {
    return Keyboard.#keyboardObjects.map((kb) => kb.#keyboardname);
  }

  // --- GETTER ---

  getSize() {
    return { height: this.#halfRows, length: this.#halfFieldsInARow };
  }

  getKeys() {
    return Object.values(this.#keys);
  }

  getArea() {
    return this.#area;
  }

  /**
   * Exportiert das Keyboard in ein JSON-Format
   */
  exportKeyboard(directorypath) {
    const exportData = {
      keyboardname: this.#keyboardname,
      halfRows: this.#halfRows,
      halfFieldsInARow: this.#halfFieldsInARow,
      keys: this.#keys
    };
    fs.writeFileSync(
      path.join(directorypath, `${this.#keyboardname}_Keyboard.json`),
      JSON.stringify(exportData, null, 2)
    );
  }
}

module.exports = Keyboard;
