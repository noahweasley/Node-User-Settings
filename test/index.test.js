const { describe, expect, test, afterEach } = require("@jest/globals");
require("dotenv").config();
const path = require("path");

const settings = require("../src/index")({
  useElectronStorage: false,
  preferenceFileDir: process.env.NODE_USER_SETTINGS_DIRECTORY,
  fileName: "Settings",
  fileExt: "json"
});

afterEach(async () => {
  await settings.deleteFile();
  await settings.deleteFile(process.env.OPTIONAL_FILENAME);
});

describe("General settings api tests", () => {
  test("throws an exception while trying to set a previously set preference file path", () => {
    expect(() => settings.setDefaultPreferenceFilePath("./")).toThrowError();
  });

  test("throws an exception while trying to set an invalid file format", () => {
    const settings = require("../src/index").defaults;
    expect(() => settings.setDefaultPreferenceFilePath("./")).toThrowError();
  });

  test("sets a new preference file path if not initialized previously", () => {
    const settings = require("../src/index")();
    let path = settings.setDefaultPreferenceFilePath(process.env.NODE_USER_SETTINGS_FILE_PATH);
    expect(path).toBe(process.env.NODE_USER_SETTINGS_FILE_PATH);
  });

  test("throws an exception while trying to use electron storage in non-Electron js application", () => {
    const settings = require("../src/index").defaults;
    expect(() => settings.getState("moduleName")).toThrowError();
  });

  test("checks if useElectronStorage flag is false", () => {
    expect(settings.isUsingElectronStorage()).toBe(false);
  });

  test("check if the set electronFilePath is the same, but normalized", () => {
    const settings = require("../src/index").defaults;
    settings.setElectronFilePath("/settings.json");

    let electronFilePath = settings.getElectronFilePath();
    expect(electronFilePath).toBe(path.normalize("/settings.json"));
  });
});

describe("Promise-based settings api tests", () => {
  test("asynchronously sets a value without optional filename ( returning a promise )", async () => {
    let isSet = await settings.setState("moduleName", "node-user-settings");
    expect(isSet).toBe(true);
  });

  test("asynchronously gets a value without optional filename ( returning a promise )", async () => {
    await settings.serialize({ moduleName: "node-user-settings" });

    let value = await settings.getState("moduleName");
    expect(value).toBe("node-user-settings");
  });

  test("asynchronously sets a value with optional filename ( returning a promise )", async () => {
    let isSet = await settings.setState("moduleName", "node-user-settings", process.env.OPTIONAL_FILENAME);
    expect(isSet).toBe(true);
  });

  test("asynchronously gets a value with optional filename ( returning a promise )", async () => {
    await settings.serialize({ moduleName: "node-user-settings" }, process.env.OPTIONAL_FILENAME);

    let value = await settings.getState("moduleName", "default", process.env.OPTIONAL_FILENAME);
    expect(value).toBe("node-user-settings");
  });

  test("asynchronously set multiple values without optional filename ( returning a promise )", async () => {
    let persisted = await settings.setStates({
      moduleName: "node-user-settings",
      version: "1.0.0",
      author: "noahweasley"
    });
    expect(persisted).toEqual(["node-user-settings", "1.0.0", "noahweasley"]);
  });

  test("asynchronously get multiple values without optional filename ( returning a promise )", async () => {
    await settings.serialize({
      moduleName: "node-user-settings",
      version: "1.0.0",
      author: "noahweasley"
    });

    let values = await settings.getStates(["moduleName", "version", "author"]);
    expect(values).toEqual(["node-user-settings", "1.0.0", "noahweasley"]);
  });

  test("asynchronously set multiple values with optional filename ( returning a promise )", async () => {
    let persisted = await settings.setStates(
      {
        moduleName: "node-user-settings",
        version: "1.0.0",
        author: "noahweasley"
      },
      process.env.OPTIONAL_FILENAME
    );
    expect(persisted).toEqual(["node-user-settings", "1.0.0", "noahweasley"]);
  });

  test("asynchronously get multiple values with optional filename ( returning a promise )", async () => {
    await settings.serialize(
      {
        moduleName: "node-user-settings",
        version: "1.0.0",
        author: "noahweasley"
      },
      process.env.OPTIONAL_FILENAME
    );

    let values = await settings.getStates(["moduleName", "version", "author"], process.env.OPTIONAL_FILENAME);
    expect(values).toEqual(["node-user-settings", "1.0.0", "noahweasley"]);
  });

  test("asynchronously delete a single entry without optional filename ( returning a promise )", async () => {
    let isDeleted = await settings.deleteKey("author");
    expect(isDeleted).toBe(true);
  });

  test("asynchronously delete a single entry with optional filename ( returning a promise )", async () => {
    let isDeleted = await settings.deleteKey("author", process.env.OPTIONAL_FILENAME);
    expect(isDeleted).toBe(true);
  });

  test("asynchronously check if a single entry exists without optional filename ( returning a promise )", async () => {
    await settings.serialize({ moduleName: "node-user-settings" });

    let hasKey = await settings.hasKey("moduleName");
    expect(hasKey).toBe(true);
  });

  test("asynchronously check if a single entry exists with optional filename  ( returning a promise )", async () => {
    await settings.serialize({ moduleName: "node-user-settings" }, process.env.OPTIONAL_FILENAME);

    let hasKey = await settings.hasKey("moduleName", process.env.OPTIONAL_FILENAME);
    expect(hasKey).toBe(true);
  });

  test("asynchronously deletes preference file without optional filename ( returning a promise )", async () => {
    // data is empty because the preference just needs to exist
    await settings.serialize({});

    let isDeleted = await settings.deleteFile();
    expect(isDeleted).toBe(true);
  });

  test("asynchronously deletes preference file without optional filename ( returning a promise )", async () => {
    // data is empty because the preference just needs to exist
    await settings.serialize({}, process.env.OPTIONAL_FILENAME);

    let isDeleted = await settings.deleteFile(process.env.OPTIONAL_FILENAME);
    expect(isDeleted).toBe(true);
  });
});

describe("Synchronous-based settings api tests", () => {
  test("synchronously sets a value without optional filename", () => {
    let isSet = settings.setStateSync("moduleName", "node-user-settings");
    expect(isSet).toBe(true);
  });

  test("synchronously gets a value without optional filename", () => {
    settings.serializeSync({ moduleName: "node-user-settings" });

    let value = settings.getStateSync("moduleName");
    expect(value).toBe("node-user-settings");
  });

  test("synchronously sets a value with optional filename", () => {
    let isSet = settings.setStateSync("moduleName", "node-user-settings", process.env.OPTIONAL_FILENAME);
    expect(isSet).toBe(true);
  });

  test("synchronously gets a value with optional filename", () => {
    settings.serializeSync({ moduleName: "node-user-settings" }, process.env.OPTIONAL_FILENAME);

    let value = settings.getStateSync("moduleName", "default", process.env.OPTIONAL_FILENAME);
    expect(value).toBe("node-user-settings");
  });

  test("synchronously set multiple values without optional filename", () => {
    let persisted = settings.setStatesSync({
      moduleName: "node-user-settings",
      version: "1.0.0",
      author: "noahweasley"
    });
    expect(persisted).toEqual(["node-user-settings", "1.0.0", "noahweasley"]);
  });

  test("synchronously get multiple values without optional filename", () => {
    settings.serializeSync({
      moduleName: "node-user-settings",
      version: "1.0.0",
      author: "noahweasley"
    });

    let values = settings.getStatesSync(["moduleName", "version", "author"]);
    expect(values).toEqual(["node-user-settings", "1.0.0", "noahweasley"]);
  });

  test("synchronously set multiple values with optional filename", () => {
    let persisted = settings.setStatesSync(
      {
        moduleName: "node-user-settings",
        version: "1.0.0",
        author: "noahweasley"
      },
      process.env.OPTIONAL_FILENAME
    );
    expect(persisted).toEqual(["node-user-settings", "1.0.0", "noahweasley"]);
  });

  test("synchronously get multiple values with optional filename", () => {
    settings.serializeSync(
      {
        moduleName: "node-user-settings",
        version: "1.0.0",
        author: "noahweasley"
      },
      process.env.OPTIONAL_FILENAME
    );

    let values = settings.getStatesSync(["moduleName", "version", "author"], process.env.OPTIONAL_FILENAME);
    expect(values).toEqual(["node-user-settings", "1.0.0", "noahweasley"]);
  });

  test("synchronously delete a single entry without optional filename", () => {
    let isDeleted = settings.deleteKeySync("moduleName");
    expect(isDeleted).toBe(true);
  });

  test("synchronously delete a single entry with optional filename", () => {
    let isDeleted = settings.deleteKeySync("version", process.env.OPTIONAL_FILENAME);
    expect(isDeleted).toBe(true);
  });

  test("synchronously check if a single entry exists without optional filename", () => {
    settings.serializeSync({ version: "1.0.0" });

    let hasKey = settings.hasKeySync("version");
    expect(hasKey).toBe(true);
  });

  test("synchronously check if a single entry exists with optional filename", () => {
    settings.serializeSync({ version: "1.0.0" }, process.env.OPTIONAL_FILENAME);

    let hasKey = settings.hasKeySync("version", process.env.OPTIONAL_FILENAME);
    expect(hasKey).toBe(true);
  });

  test("synchronously deletes preference file without optional filename", () => {
    settings.serializeSync({});

    let isDeleted = settings.deleteFileSync();
    expect(isDeleted).toBe(true);
  });

  test("synchronously deletes preference file with optional filename", () => {
    settings.serializeSync({}, process.env.OPTIONAL_FILENAME);

    let isDeleted = settings.deleteFileSync(process.env.OPTIONAL_FILENAME);
    expect(isDeleted).toBe(true);
  });
});

describe("Callback-based settings api tests", () => {
  test("asynchronously check if a single entry exists without optional filename", (done) => {
    settings.serializeSync({ version: "1.0.0" });

    settings.hasKey_c("version", null, (err, hasKey) => {
      expect(err).toBe(null);
      expect(hasKey).toBe(true);
      done();
    });
  });

  test("asynchronously check if a single entry exists with optional filename", (done) => {
    settings.serializeSync({ version: "1.0.0" }, process.env.OPTIONAL_FILENAME);

    settings.hasKey_c("version", process.env.OPTIONAL_FILENAME, (err, hasKey) => {
      expect(err).toBe(null);
      expect(hasKey).toBe(true);
      done();
    });
  });

  test("asynchronously gets a value, using callbacks without optional filename", (done) => {
    settings.serializeSync({ moduleName: "node-user-settings" });

    settings.getState_c("moduleName", null, null, (err, value) => {
      expect(err).toBe(null);
      expect(value).toBe("node-user-settings");
      done();
    });
  });

  test("asynchronously gets a value, using callbacks with optional filename", (done) => {
    settings.serializeSync({ moduleName: "node-user-settings" }, process.env.OPTIONAL_FILENAME);

    settings.getState_c("moduleName", null, process.env.OPTIONAL_FILENAME, (err, value) => {
      expect(err).toBe(null);
      expect(value).toBe("node-user-settings");
      done();
    });
  });

  test("asynchronously sets a value without optional filename, using callback", (done) => {
    settings.setState_c("moduleName", "node-user-settings", null, (err, isSet) => {
      expect(err).toBe(null);
      expect(isSet).toBe(true);
      done();
    });
  });

  test("asynchronously sets a value with optional filename, using callback", (done) => {
    settings.setState_c("moduleName", "node-user-settings", process.env.OPTIONAL_FILENAME, (err, isSet) => {
      expect(err).toBe(null);
      expect(isSet).toBe(true);
      done();
    });
  });

  test("asynchronously gets multiple values without optional filename, using callback", (done) => {
    settings.serializeSync({
      moduleName: "node-user-settings",
      version: "1.0.0",
      author: "noahweasley"
    });

    settings.getStates_c(["moduleName", "version", "author"], null, (err, values) => {
      expect(err).toBe(null);
      expect(values).toEqual(["node-user-settings", "1.0.0", "noahweasley"]);
      done();
    });
  });

  test("asynchronously gets multiple values with optional filename, using callback", (done) => {
    settings.serializeSync(
      { moduleName: "node-user-settings", version: "1.0.0", author: "noahweasley" },
      process.env.OPTIONAL_FILENAME
    );

    settings.getStates_c(["moduleName", "version", "author"], process.env.OPTIONAL_FILENAME, (err, values) => {
      expect(err).toBe(null);
      expect(values).toEqual(["node-user-settings", "1.0.0", "noahweasley"]);
      done();
    });
  });

  test("asynchronously set multiple values without optional filename, using callback", (done) => {
    const preferenceObjectToPersist = {
      moduleName: "node-user-settings",
      version: "1.0.0",
      author: "noahweasley"
    };

    settings.setStates_c(preferenceObjectToPersist, null, (err, persisted) => {
      expect(err).toBe(null);
      expect(persisted).toEqual(["node-user-settings", "1.0.0", "noahweasley"]);
      done();
    });
  });

  test("asynchronously set multiple values with optional filename, using callback", (done) => {
    const preferenceObjectToPersist = {
      moduleName: "node-user-settings",
      version: "1.0.0",
      author: "noahweasley"
    };

    settings.setStates_c(preferenceObjectToPersist, process.env.OPTIONAL_FILENAME, (err, persisted) => {
      expect(err).toBe(null);
      expect(persisted).toEqual(["node-user-settings", "1.0.0", "noahweasley"]);
      done();
    });
  });

  test("asynchronously delete preference file without optional filename, using callback", (done) => {
    settings.serializeSync({});

    settings.deleteFile_c(null, (err, isDeleted) => {
      expect(err).toBe(null);
      expect(isDeleted).toBe(true);
      done();
    });
  });

  test("asynchronously delete preference file with optional filename, using callback", (done) => {
    settings.serializeSync({}, process.env.OPTIONAL_FILENAME);

    settings.deleteFile_c(process.env.OPTIONAL_FILENAME, (err, isDeleted) => {
      expect(err).toBe(null);
      expect(isDeleted).toBe(true);
      done();
    });
  });
});

describe("Anonymous API tests", () => {
  test("overrides preference file path when optional file path is specified", () => {
    // @TODO fix bug: path gotten from dotenv contains extra slashes, even when it doesn't
    const normalizedPath = path.normalize(process.env.NODE_USER_SETTINGS_OPTIONAL_FILE_PATH);

    const settings = require("../src/index").defaults;
    settings.setDefaultPreferenceFilePath(process.env.NODE_USER_SETTINGS_FILE_PATH);

    settings.serializeSync({ moduleName: "node-user-settings" }, process.env.OPTIONAL_FILENAME);

    let hasKey = settings.hasKeySync("moduleName", process.env.OPTIONAL_FILENAME);
    let newFilePathAfterOverride = settings.getTempPreferenceOptionalFilePath();

    expect(hasKey).toBe(true);
    expect(newFilePathAfterOverride).toBe(normalizedPath);
  });
});
