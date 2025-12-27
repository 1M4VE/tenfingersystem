// 1. Styles definieren und in den Head einfügen
const style = document.createElement("style");
style.textContent = `
    :root {
        --key-bg: #ffffff;
        --key-text: #333;
        --key-border: #d1d5db;
        --highlight-color: #3b82f6;
        --bg-color: #f3f4f6;
    }

    body {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        background-color: var(--bg-color);
        margin: 0;
        font-family: 'Segoe UI', sans-serif;
    }

    .keyboard-container {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 20px;
        background: #e5e7eb;
        border-radius: 12px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .row {
        display: flex;
        justify-content: center;
        gap: 6px;
    }

    .row-top { margin-left: 20px; }
    .row-home { margin-left: 35px; }
    .row-bottom { margin-left: 55px; }

    .key {
        width: 50px;
        height: 50px;
        background: var(--key-bg);
        border: 1px solid var(--key-border);
        border-radius: 6px;
        display: flex;
        justify-content: center;
        align-items: center;
        font-weight: 600;
        text-transform: uppercase;
        transition: all 0.1s;
        user-select: none;
    }

    .key-space { width: 300px; }

    .highlight {
        background-color: var(--highlight-color) !important;
        color: white;
        transform: translateY(2px);
        box-shadow: 0 0 10px var(--highlight-color);
    }
`;
document.head.appendChild(style);

// 2. HTML Struktur als String definieren
const keyboardLayout = `
<div class="keyboard-container">
    <div class="row row-top">
        ${["q", "w", "e", "r", "t", "z", "u", "i", "o", "p", "ü"]
          .map((k) => `<div class="key" id="key-${k}">${k}</div>`)
          .join("")}
    </div>
    <div class="row row-home">
        ${["a", "s", "d", "f", "g", "h", "j", "k", "l", "ö", "ä"]
          .map((k) => `<div class="key" id="key-${k}">${k}</div>`)
          .join("")}
    </div>
    <div class="row row-bottom">
        ${["y", "x", "c", "v", "b", "n", "m"]
          .map((k) => `<div class="key" id="key-${k}">${k}</div>`)
          .join("")}
    </div>
    <div class="row">
        <div class="key key-space" id="key-space"></div>
    </div>
</div>
`;

// 3. In den Body injizieren
document.body.innerHTML = keyboardLayout;

// 4. Logik für die Tastatur-Visualisierung
window.addEventListener("keydown", (e) => {
  const id = e.key === " " ? "key-space" : "key-" + e.key.toLowerCase();
  const el = document.getElementById(id);
  if (el) el.classList.add("highlight");
});

window.addEventListener("keyup", (e) => {
  const id = e.key === " " ? "key-space" : "key-" + e.key.toLowerCase();
  const el = document.getElementById(id);
  if (el) el.classList.remove("highlight");
});
