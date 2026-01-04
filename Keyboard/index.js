const fs = require("fs");
const path = require("path");
const { runInThisContext } = require("vm");

class Keyboard {
  #halfRows;
  #fieldsInARow;
  static #keyboards = [];
  static #keyboardObjects = [];
  #keyboardname;
  #keyLabels = [];
  #plätze = {};

  /**
   * Statische Methode zum Importieren
   */
  static importKeyboards(directorypath) {
    // Check ob Verzeichnis existiert
    if (!fs.existsSync(directorypath)) {
      throw Object.assign(new Error("The directory is nowhere to be found"), {
        name: "directoryNotFound"
      });
    }

    // Dateien scannen und filtern
    const keyboardFiles = fs
      .readdirSync(directorypath)
      .filter((file) => file.endsWith("_Keyboard.json"));

    if (keyboardFiles.length === 0) {
      throw Object.assign(
        new Error(`No keyboards found in: ${directorypath}`),
        { name: "noKeyboardsFoundinDirectory" }
      );
    }

    // Dateien einlesen und Instanzen erstellen
    keyboardFiles.map((file) => {
      const rawData = fs.readFileSync(path.join(directorypath, file), "utf8");
      const data = JSON.parse(rawData);
      // Neue Instanz erstellen
      const kb = new Keyboard({
        keyboardname: data.keyboardname,
        rows: data.halfRows / 2, // Zurückrechnen für den Constructor
        keysInARow: data.fieldsInARow / 2
      });

      // Tasten wiederherstellen
      if (data.keys) {
        data.keys.forEach((k) => {
          kb.createKey({
            name: k.name,
            length: k.length,
            height: k.height,
            halfRow: k.leftTop.row,
            field: k.leftTop.field
          });
        });
      }
    });
  }
  static searchKeyboard(name) {
    for (let keyboardobject of Keyboard.#keyboardObjects) {
      if (keyboardobject.#keyboardname === name) {
        return keyboardobject;
      }
    }
    return false;
  }
  /**
   * Export-Methode für die JSON-Speicherung
   */
  exportKeyboard(directorypath) {
    fs.writeFileSync(
      path.join(directorypath, `${this.#keyboardname}_Keyboard.json`),
      JSON.stringify(
        {
          keyboardname: this.#keyboardname,
          halfRows: this.#halfRows,
          fieldsInARow: this.#fieldsInARow,
          keys: this.#keyLabels.map((entry) => {
            const id = Object.keys(entry)[0];
            return {
              id: id,
              name: entry[id].name,
              length: entry[id].length,
              height: entry[id].height,
              leftTop: entry[id].leftTop
            };
          })
        },
        null,
        2
      )
    );
  }

  constructor(c) {
    this.#halfRows = (c?.rows ?? 3) * 2; // Default 6 halfRows
    this.#fieldsInARow = (c?.keysInARow ?? 14) * 2;

    if (Keyboard.#keyboards.includes(c?.keyboardname)) {
      throw Object.assign(new Error("This Keyboardname Already Exists"), {
        name: "keyboardnameAlreadyExists"
      });
    }
    this.#keyboardname =
      c?.keyboardname ?? "Default_Keyboard_" + Keyboard.#keyboards.length;
    Keyboard.#keyboards.push(this.#keyboardname);

    for (let i = 1; i <= this.#halfRows; i++) {
      let rowObj = {};
      for (let j = 1; j <= this.#fieldsInARow; j++) {
        rowObj[`${i}_${j}`] = { belegt: false, key: null };
      }
      this.#plätze[i] = rowObj;
    }
    Keyboard.#keyboardObjects.push(this);
  }

  createKey(k) {
    if (k?.halfRow === undefined || k?.field === undefined) {
      throw Object.assign(new Error("Key benötigt halfRow und field."), {
        name: "missingKeyCoordinates"
      });
    }

    const length = k?.length ?? 2;
    const height = k?.height ?? 2;

    for (let r = k.halfRow; r < k.halfRow + height; r++) {
      for (let f = k.field; f < k.field + length; f++) {
        if (!this.#plätze[r] || !this.#plätze[r][`${r}_${f}`]) {
          throw Object.assign(new Error("Außerhalb des Keyboards"), {
            name: "keyOutOfBounds"
          });
        }
        if (this.#plätze[r][`${r}_${f}`].belegt) {
          throw Object.assign(new Error("Kollision"), { name: "keyCollision" });
        }
      }
    }

    const finalIndex = this.#keyLabels.length + 1; // Vereinfachte Index-Logik für das Beispiel
    const key = {
      name: k?.name ?? "key_" + finalIndex,
      length: length,
      height: height,
      leftTop: { row: k.halfRow, field: k.field }
    };

    this.#keyLabels.push({ [finalIndex]: key });
    this.#toggleGridSpace(k.halfRow, k.field, length, height, true, finalIndex);
    return finalIndex;
  }

  #toggleGridSpace(row, field, len, hei, isBelegt, keyIndex) {
    for (let r = row; r < row + hei; r++) {
      for (let f = field; f < field + len; f++) {
        const fieldKey = `${r}_${f}`;
        if (this.#plätze[r] && this.#plätze[r][fieldKey]) {
          this.#plätze[r][fieldKey].belegt = isBelegt;
          this.#plätze[r][fieldKey].key = keyIndex;
        }
      }
    }
  }
  #getKeyboardname() {
    return this.#keyboardname;
  }
}
module.exports = Keyboard;
