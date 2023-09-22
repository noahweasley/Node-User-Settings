"use-strict";

const settings = require("../src/index").defaults;

// disable electron storage path else exception is thrown
settings.setUseElectronStorage(false);
settings.setDefaultPreferenceFilePath("./examples/settings.json");

const name = settings.getStateSync("name", "Unknown");

const optionalFilename = "user-settings.json";

const version = settings.getStateSync("version", "1.0.0", optionalFilename);

console.log("got: %s and %s", name, version);
