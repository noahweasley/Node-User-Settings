"use-strict";

const settings = require("../src/index").defaults;

settings.setDefaultPreferenceFilePath("./examples/settings.json");

(async function main() {
  let name1 = await settings.getState("name", "Noah");

  let optionalFilename = "user-settings.json";
  let name2 = await settings.getState("name", "Noah", optionalFilename);

  console.log("got: %s and %s", name1, name2);
})();
