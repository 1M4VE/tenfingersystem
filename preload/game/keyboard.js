/**
 * Keyboardslayouts
 */
class Keyboard {
  #rows;
  #fieldsInARow;
  static #keyboards = [];
  #keyboardname;
  #keyLabels = [];
  #plätze = {};

  /**
   * @param {Object} c
   * @param {number} [c.rows=6]
   * @param {number} [c.keysInARow=14]
   * @param {string} [c.keyboardname]
   */
  constructor(c) {
    this.#rows = c?.rows ?? 6;
    this.#fieldsInARow = (c?.keysInARow ?? 14) * 2;

    if (Keyboard.#keyboards.includes(c?.keyboardname)) {
      throw new Error("This Keyboardname Already Exists");
    }
    this.#keyboardname =
      c?.keyboardname ?? "Default_Keyboard_" + Keyboard.#keyboards.length;
    Keyboard.#keyboards.push(this.#keyboardname);

    for (let i = 1; i <= this.#rows; i++) {
      let row = {};
      for (let j = 1; j <= this.#fieldsInARow; j++) {
        row[`${i}_${j}`] = {};
      }
      this.#plätze[i] = row;
    }
  }

  /**
   * @param {Object} k
   * @param {string} [k.name]
   * @param {number} [k.length]
   * @param {number} [k.height]
   */
  createKey(k) {
    const key = {};

    // Hilfsfunktion zur Namensgenerierung
    const applyKeyName = (index) => {
      key.name = k?.name ?? "key_" + index;
    };

    // Validierung der Höhe
    if ("height" in k) {
      if (!(k.height > 0 && k.height < 3)) {
        throw new Error("Die Höhe einer Taste kann nur 1 oder 2 betragen");
      }
    }

    key.length = k?.length ?? 2;
    key.height = k?.height ?? 2;

    // 1. Fall: Liste ist leer
    if (this.#keyLabels.length === 0) {
      applyKeyName(1);
      this.#keyLabels.push({ 1: key });
      return;
    }

    for (let i = 0; i < this.#keyLabels.length; i++) {
      const expectedIndex = i + 1;
      const entry = this.#keyLabels[i];

      if (!entry.hasOwnProperty(expectedIndex)) {
        applyKeyName(expectedIndex);
        this.#keyLabels.splice(i, 0, { [expectedIndex]: key });
        return;
      }
    }

    const newIndex = this.#keyLabels.length + 1;
    applyKeyName(newIndex);
    this.#keyLabels.push({ [newIndex]: key });
  }
}
