/**
 * Hilfsfunktion für Inline-Styling
 */
function style(element, styles) {
  for (let property in styles) {
    element.style[property] = styles[property];
  }
}

async function app() {
  const keyboardPanel = document.createElement("div");
  const gamePanel = document.createElement("div");
  const upperPanel = document.createElement("div");
  const lowerPanel = document.createElement("div");
  const keyMap = {};

  // Wir speichern Referenzen zu den Tasten-Elementen, um sie später beim Resize anzupassen
  const keyElementsRef = [];

  // Body Layout
  style(document.body, {
    margin: "0",
    height: "100vh",
    width: "100vw",
    position: "relative",
    backgroundColor: "#ffffff",
    overflow: "hidden"
  });

  // --- 1. UPPER PANEL (20%) ---
  style(upperPanel, {
    position: "absolute",
    top: "0",
    left: "0",
    height: "20%",
    width: "100%",
    backgroundColor: "rgba(255, 0, 0, 0.2)",
    zIndex: "10",
    pointerEvents: "none"
  });

  // --- 2. GAME PANEL (95%) ---
  style(gamePanel, {
    position: "absolute",
    top: "0",
    left: "0",
    height: "95%",
    width: "100%",
    backgroundColor: "#e0e0e0",
    zIndex: "1",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end", // Schiebt Keyboard nach unten
    alignItems: "center"
  });

  // --- 3. LOWER PANEL (5%) ---
  style(lowerPanel, {
    position: "absolute",
    bottom: "0",
    left: "0",
    height: "5%",
    width: "100%",
    backgroundColor: "#333",
    zIndex: "10"
  });

  document.body.appendChild(gamePanel);
  document.body.appendChild(upperPanel);
  document.body.appendChild(lowerPanel);
  gamePanel.appendChild(keyboardPanel);

  // API Calls
  await window.mainAPI.load_keyboards();
  const keyboardName = "German_QWERTZ_Standard";
  const size = await window.mainAPI.getKeyboardSize(keyboardName);
  const keys = await window.mainAPI.getKeyboardKeys(keyboardName);

  const columns = size.length;
  const rows = size.height;
  const padding = 10;

  // Grundstyling des Keyboard Panels (statische Werte)
  style(keyboardPanel, {
    display: "grid",
    backgroundColor: "#747171",
    borderRadius: "8px 8px 8px 8px",
    padding: `10px`,
    gap: "2px",
    border: "4px solid #333",
    boxShadow: "0 -5px 20px rgba(0,0,0,0.3)",
    width: "fit-content",
    marginBottom: "1%" // 1% Abstand vom Boden
  });

  // Tasten erstellen (aber noch keine festen Größen setzen)
  keys.forEach((key) => {
    const keyEl = document.createElement("div");

    // Grid Position ist relativ und ändert sich nicht bei Resize
    style(keyEl, {
      gridRow: `${key.gridPos.rowStart} / span ${key.gridPos.rowSpan}`,
      gridColumn: `${key.gridPos.colStart} / span ${key.gridPos.colSpan}`,
      position: "relative",
      backgroundColor: "#ffffff",
      borderRadius: "4px",
      border: "1px solid #444",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      userSelect: "none"
    });

    // Wir geben den Spans Klassen, damit wir sie später per JS greifen können
    keyEl.innerHTML = `
        <span class="label-sec" style="position:absolute; top:2px; left:4px; color:#888;">${
          key.keyLabel.secondary || ""
        }</span>
        <span class="label-prim" style="font-weight:bold;">${
          key.keyLabel.primary
        }</span>
        <span class="label-tert" style="position:absolute; bottom:2px; right:4px; color:#666;">${
          key.keyLabel.tertiary || ""
        }</span>
      `;

    // Speichere Referenz für Updates
    keyElementsRef.push(keyEl);

    // Event Mapping
    [
      key.keyEvent.primary,
      key.keyEvent.secondary,
      key.keyEvent.tertiary
    ].forEach((ev) => {
      if (ev) keyMap[ev] = keyEl;
    });

    keyboardPanel.appendChild(keyEl);
  });

  // --- DIE RESIZE LOGIK ---
  function updateLayout() {
    // 1. Verfügbare Höhe neu berechnen
    const gamePanelHeight = window.innerHeight * 0.95;

    // Faktor 0.5 = Das Keyboard nimmt 50% der GamePanel-Höhe ein
    // Erhöhe diesen Wert (z.B. 0.6), wenn es noch größer sein soll
    const keyboardTargetHeight = gamePanelHeight * 0.35;

    // 2. FieldSize neu berechnen
    const fieldSize = Math.floor((keyboardTargetHeight - padding * 2) / rows);

    // 3. Grid im Container aktualisieren
    style(keyboardPanel, {
      gridTemplateColumns: `repeat(${columns}, ${fieldSize}px)`,
      gridAutoRows: `${fieldSize}px`
    });

    // 4. Schriftgrößen in allen Tasten aktualisieren
    keyElementsRef.forEach((el) => {
      const sec = el.querySelector(".label-sec");
      const prim = el.querySelector(".label-prim");
      const tert = el.querySelector(".label-tert");

      if (sec) sec.style.fontSize = `${fieldSize / 3.5}px`;
      if (prim) prim.style.fontSize = `${fieldSize / 2.5}px`;
      if (tert) tert.style.fontSize = `${fieldSize / 3.5}px`;
    });
  }

  // Initialer Aufruf
  updateLayout();

  // Event Listener: Feuert jedes Mal, wenn das Fenster die Größe ändert
  window.addEventListener("resize", updateLayout);

  // --- Event Feedback ---
  window.addEventListener("keydown", (e) => {
    if (keyMap[e.code] || keyMap[e.key]) {
      const target = keyMap[e.code] || keyMap[e.key];
      target.style.backgroundColor = "royalblue";
      target.style.color = "white";
    }
  });
  window.addEventListener("keyup", (e) => {
    if (keyMap[e.code] || keyMap[e.key]) {
      const target = keyMap[e.code] || keyMap[e.key];
      target.style.backgroundColor = "#ffffff";
      target.style.color = "black";
    }
  });
}

app();
