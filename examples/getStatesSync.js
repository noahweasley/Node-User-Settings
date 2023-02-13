"use-strict";

const settings = require("../src/index").defaults;

// disable electron storage path else exception is thrown
settings.setUseElectronStorage(false);
settings.setDefaultPreferenceFilePath("./examples/settings.json");

let value1 = settings.getStatesSync(["name", "version"]);

let optionalFilename = "user-settings.json";

let value2 = settings.getStatesSync(["name", "Job"], optionalFilename);

console.log("got: %s", [...value1, ...value2]);
