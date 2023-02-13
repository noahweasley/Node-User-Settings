"use-strict";

const settings = require("../src/index").defaults;

// disable electron storage path else exception is thrown
settings.setUseElectronStorage(false);
settings.setDefaultPreferenceFilePath("./examples/settings.json");

(async function main() {
  let optionalFilename = "user-settings.json";
  
  let isSet = await settings.setState("name", "Noah");
  let isSet2 = await settings.setState("version", "1.0.0", optionalFilename);
 
  console.log("is value set? %s and %s", isSet, isSet2);
})();