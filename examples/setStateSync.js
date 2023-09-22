"use-strict";

const settings = require("../src/index").defaults;

// disable electron storage path else exception is thrown
settings.setUseElectronStorage(false);
settings.setDefaultPreferenceFilePath("./examples/settings.json");

const isSet = settings.setStateSync("name", "Noah");

const optionalFilename = "user-settings.json";

const isSet2 = settings.setStateSync("version", "1.0.0", optionalFilename);

console.log("is name set (sync): %s and %s", isSet, isSet2);
