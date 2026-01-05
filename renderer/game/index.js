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
  const keyMap = {};

  style(document.body, {
    margin: "0",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#111",
    overflow: "hidden"
  });

  style(gamePanel, {
    flex: "1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px"
  });

  document.body.appendChild(gamePanel);
  gamePanel.appendChild(keyboardPanel);

  await window.mainAPI.load_keyboards();
  const keyboardName = "German_QWERTZ_Standard";
  const size = await window.mainAPI.getKeyboardSize(keyboardName);
  const keys = await window.mainAPI.getKeyboardKeys(keyboardName);

  // --- PIXELGENAUE BERECHNUNG ---
  const columns = size.length; // 28
  const rows = size.height; // 12
  const gap = 2; // Gap in Pixeln
  const padding = 10; // Padding des Containers

  // Wir berechnen, wie groß ein Feld maximal sein darf, damit es in den Viewport passt
  const availableWidth = window.innerWidth - 100; // Puffer für Ränder
  const fieldSize = Math.floor(availableWidth / columns); // Abrunden für echte Pixel

  style(keyboardPanel, {
    display: "grid",
    // Wir setzen die Spalten und Zeilen auf den EXAKT gleichen Pixelwert
    gridTemplateColumns: `repeat(${columns}, ${fieldSize}px)`,
    gridAutoRows: `${fieldSize}px`,
    backgroundColor: "#1a1a1a",
    borderRadius: "8px",
    width: "100%",
    border: "2px solid #333"
  });

  keys.forEach((key) => {
    const keyEl = document.createElement("div");

    style(keyEl, {
      gridRow: `${key.gridPos.rowStart} / span ${key.gridPos.rowSpan}`,
      gridColumn: `${key.gridPos.colStart} / span ${key.gridPos.colSpan}`,
      position: "relative",
      backgroundColor: "#2a2a2a",
      borderRadius: "4px",
      border: "1px solid #444",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      boxSizing: "border-box" // Verhindert, dass Border die 2x2 Form sprengt
    });

    keyEl.innerHTML = `
        <span style="position:absolute; top:4px; left:6px; font-size:10px; color:#888;">${key.keyLabel.secondary}</span>
        <span style="font-size:16px; font-weight:bold;">${key.keyLabel.primary}</span>
        <span style="position:absolute; bottom:4px; right:6px; font-size:10px; color:#666;">${key.keyLabel.tertiary}</span>
      `;

    [
      key.keyEvent.primary,
      key.keyEvent.secondary,
      key.keyEvent.tertiary
    ].forEach((ev) => {
      if (ev) keyMap[ev] = keyEl;
    });

    keyboardPanel.appendChild(keyEl);
  });

  // --- Event Feedback ---
  window.addEventListener("keydown", (e) => {
    if (keyMap[e.key]) keyMap[e.key].style.backgroundColor = "royalblue";
  });
  window.addEventListener("keyup", (e) => {
    if (keyMap[e.key]) keyMap[e.key].style.backgroundColor = "#2a2a2a";
  });
}

app();
