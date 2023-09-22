"use-strict";

const settings = require("../src/index").defaults;

// disable electron storage path else exception is thrown
settings.setUseElectronStorage(false);
settings.setDefaultPreferenceFilePath("./examples/settings.json");

const hasName = settings.hasKeySync("name");

const optionalFilename = "user-settings.json";

const hasVersion = settings.hasKeySync("version", optionalFilename);

console.log("Preference has name ? : %s", hasName);

console.log("Preference has version ? : %s", hasVersion);
