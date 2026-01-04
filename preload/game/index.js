function style(element, styles) {
  for (let property in styles) {
    element.style[property] = styles[property];
  }
}
let UpperPanel = document.createElement("div");
let BottomPanel = document.createElement("div");
let GamePanel = document.createElement("div");
style(document.body, { display: "flex", flexDirection: "column" });
style(UpperPanel);
document.body.appendChild(UpperPanel);
document.body.appendChild(GamePanel);
document.body.appendChild(BottomPanel);
