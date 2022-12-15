"use-strict";

const settings = require("../src/index").defaults;

settings.setDefaultPreferenceFilePath("./examples/settings.json");

(async function main() {
  let optionalFilename = "user-settings.json";
  
  let hasName = await settings.hasKey("name");
  let hasName2 = await settings.hasKey("name", optionalFilename);
 
  console.log("Preference has name? : %s", hasName);
  console.log("Optional preference has name ? : %s", hasName2);
})();