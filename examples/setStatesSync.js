"use-strict";

const settings = require("../src/index").defaults;

// disable electron storage path else exception is thrown
settings.setUseElectronStorage(false);
settings.setDefaultPreferenceFilePath("./examples/settings.json");

const value1 = settings.setStatesSync({ name: "Noah", version: "1.0.0" });

const optionalFilename = "user-settings.json";

const value2 = settings.setStatesSync({ name: "Wesley", Job: "Front end Engineer" }, optionalFilename);

console.log("The values there were set %s", [...value1, ...value2]);
