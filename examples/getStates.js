"use-strict";

const settings = require("../src/index").defaults;

settings.setDefaultPreferenceFilePath("./examples/settings.json");

(async function main() {
  let value1 = await settings.getStates(["name", "version"]);

  let optionalFilename = "user-settings.json";
  let value2 = await settings.getStates(["name", "Job"], optionalFilename);

  console.log("got: %s", [...value1, ...value2]);
})();
