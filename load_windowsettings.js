const fs = require("fs");
windowsettings = () => {
  return JSON.parse(fs.readFileSync("./windowsettings.json", "utf-8"));
};
(changewindowsettings = (object) => {
  let temporarywindowsettings = windowsettings();
  for (field in object) {
    if (field in temporarywindowsettings)
      temporarywindowsettings[field] = object[field];
  }
  fs.writeFileSync(
    "windowsettings.json",
    JSON.stringify(temporarywindowsettings, null, 2),
    "utf8"
  );
}),
  (module.exports = { windowsettings, changewindowsettings });
