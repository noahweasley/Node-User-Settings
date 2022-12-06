const { describe, expect, test, afterEach, beforeEach, it } = require("@jest/globals");
// const { pumpSettings, deleteSettings } = require("./utils");
const mockData = require("./mock-data.json");
require("dotenv").config();

const settings = require("../src/index")({
  preferenceFileDir: process.env.NODE_USER_SETTINGS_DIRECTORY,
  fileName: "Settings",
  fileExt: "json"
});

const OPTIONAL_FILENAME = "UserSettings.json";

afterEach(async () => {
  await settings.deleteFile();
  await settings.deleteFile(OPTIONAL_FILENAME);
});

beforeEach(async () => {
  await settings.serialize(mockData);
  await settings.serialize(mockData, OPTIONAL_FILENAME);
});

describe("General settings api tests", () => {
  test("throws an exception while trying to set a previously set preference file path", () => {
    expect(() => settings.setDefaultPreferenceFilePath("./")).toThrowError();
  });

  test("throws an exception while trying to set an invalid file format", () => {
    const settings = require("../src/index")();
    expect(() => settings.setDefaultPreferenceFilePath("./")).toThrowError();
  });

  test("sets a new preference file path if not initialized previously", () => {
    const settings = require("../src/index")();
    let path = settings.setDefaultPreferenceFilePath(process.env.NODE_USER_SETTINGS_FILE_PATH);
    expect(path).toBe(process.env.NODE_USER_SETTINGS_FILE_PATH);
  });
});

describe("Promise-based settings api tests", () => {
  test("asynchronously sets a value without optional filename ( returning a promise )", async () => {
    let isSet = await settings.setState("moduleName", "node-user-settings");
    expect(isSet).toBe(true);
  });

  test("asynchronously gets a value without optional filename ( returning a promise )", async () => {
    let value = await settings.getState("moduleName");
    expect(value).toBe("node-user-settings");
  });

  test("asynchronously sets a value with optional filename ( returning a promise )", async () => {
    let isSet = await settings.setState("moduleName", "node-user-settings", OPTIONAL_FILENAME);
    expect(isSet).toBe(true);
  });

  test("asynchronously gets a value with optional filename ( returning a promise )", async () => {
    let value = await settings.getState("moduleName", OPTIONAL_FILENAME);
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
      OPTIONAL_FILENAME
    );
    expect(persisted).toEqual(["node-user-settings", "1.0.0", "noahweasley"]);
  });

  test("asynchronously get multiple values with optional filename ( returning a promise )", async () => {
    let values = await settings.getStates(["moduleName", "version", "author"], OPTIONAL_FILENAME);
    expect(values).toEqual(["node-user-settings", "1.0.0", "noahweasley"]);
  });

  test("asynchronously delete a single entry without optional filename ( returning a promise )", async () => {
    let isDeleted = await settings.deleteKey("author");
    expect(isDeleted).toBe(true);
  });

  test("asynchronously delete a single entry with optional filename ( returning a promise )", async () => {
    let isDeleted = await settings.deleteKey("author", OPTIONAL_FILENAME);
    expect(isDeleted).toBe(true);
  });

  test("asynchronously check if a single entry exists without optional filename ( returning a promise )", async () => {
    let hasKey = await settings.hasKey("moduleName");
    expect(hasKey).toBe(true);
  });

  test("asynchronously check if a single entry exists with optional filename  ( returning a promise )", async () => {
    let hasKey = await settings.hasKey("moduleName", OPTIONAL_FILENAME);
    expect(hasKey).toBe(true);
  });

  test("asynchronously deletes preference file without optional filename ( returning a promise )", async () => {
    let isDeleted = await settings.deleteFile();
    expect(isDeleted).toBe(true);
  });

  test("asynchronously deletes preference file without optional filename ( returning a promise )", async () => {
    let isDeleted = await settings.deleteFile(OPTIONAL_FILENAME);
    expect(isDeleted).toBe(true);
  });
});

describe("Synchronous-based settings api tests", () => {
  test("synchronously sets a value without optional filename", () => {
    let isSet = settings.setStateSync("moduleName", "node-user-settings");
    expect(isSet).toBe(true);
  });

  test("synchronously gets a value without optional filename", () => {
    let value = settings.getStateSync("moduleName");
    expect(value).toBe("node-user-settings");
  });

  test("synchronously sets a value with optional filename", () => {
    let isSet = settings.setStateSync("moduleName", "node-user-settings", OPTIONAL_FILENAME);
    expect(isSet).toBe(true);
  });

  test("synchronously gets a value with optional filename", () => {
    let value = settings.getStateSync("moduleName", OPTIONAL_FILENAME);
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
      OPTIONAL_FILENAME
    );
    expect(persisted).toEqual(["node-user-settings", "1.0.0", "noahweasley"]);
  });

  test("synchronously get multiple values with optional filename", () => {
    let values = settings.getStatesSync(["moduleName", "version", "author"], OPTIONAL_FILENAME);
    expect(values).toEqual(["node-user-settings", "1.0.0", "noahweasley"]);
  });

  test("synchronously delete a single entry without optional filename", () => {
    let isDeleted = settings.deleteKeySync("moduleName");
    expect(isDeleted).toBe(true);
  });

  test("synchronously delete a single entry with optional filename", () => {
    let isDeleted = settings.deleteKeySync("version", OPTIONAL_FILENAME);
    expect(isDeleted).toBe(true);
  });

  test("synchronously check if a single entry exists without optional filename", () => {
    let hasKey = settings.hasKeySync("version");
    expect(hasKey).toBe(true);
  });

  test("synchronously check if a single entry exists with optional filename", () => {
    let hasKey = settings.hasKeySync("version", OPTIONAL_FILENAME);
    expect(hasKey).toBe(true);
  });

  test("synchronously deletes preference file without optional filename", () => {
    let isDeleted = settings.deleteFileSync();
    expect(isDeleted).toBe(true);
  });

  test("synchronously deletes preference file with optional filename", () => {
    let isDeleted = settings.deleteFileSync(OPTIONAL_FILENAME);
    expect(isDeleted).toBe(true);
  });
});

describe("Callback-based settings api tests", () => {
  test("asynchronously check if a single entry exists without optional filename", (done) => {
    settings.hasKey_c("version", null, (err, hasKey) => {
      expect(err).toBe(null);
      expect(hasKey).toBe(true);
      done();
    });
  });

  test("asynchronously check if a single entry exists with optional filename", (done) => {
    settings.hasKey_c("version", OPTIONAL_FILENAME, (err, hasKey) => {
      expect(err).toBe(null);
      expect(hasKey).toBe(true);
      done();
    });
  });

  test("asynchronously gets a value, using callbacks without optional filename", (done) => {
    settings.getState_c("moduleName", null, null, (err, value) => {
      expect(err).toBe(null);
      expect(value).toBe("node-user-settings");
      done();
    });
  });

  test("asynchronously gets a value, using callbacks with optional filename", (done) => {
    settings.getState_c("moduleName", null, OPTIONAL_FILENAME, (err, value) => {
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
    settings.setState_c("moduleName", "node-user-settings", OPTIONAL_FILENAME, (err, isSet) => {
      expect(err).toBe(null);
      expect(isSet).toBe(true);
      done();
    });
  });

  test("asynchronously gets multiple values without optional filename, using callback", (done) => {
    settings.getStates_c(["moduleName", "version", "author"], null, (err, values) => {
      expect(err).toBe(null);
      expect(values).toEqual(["node-user-settings", "1.0.0", "noahweasley"]);
      done();
    });
  });

  test("asynchronously gets multiple values with optional filename, using callback", (done) => {
    settings.getStates_c(["moduleName", "version", "author"], OPTIONAL_FILENAME, (err, values) => {
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

    settings.setStates_c(preferenceObjectToPersist, OPTIONAL_FILENAME, (err, persisted) => {
      expect(err).toBe(null);
      expect(persisted).toEqual(["node-user-settings", "1.0.0", "noahweasley"]);
      done();
    });
  });

  test("asynchronously delete preference file without optional filename, using callback", (done) => {
    settings.deleteFile_c(null, (err, isDeleted) => {
      expect(err).toBe(null);
      expect(isDeleted).toBe(true);
      done();
    });
  });

  test("asynchronously delete preference file with optional filename, using callback", (done) => {
    settings.deleteFile_c(OPTIONAL_FILENAME, (err, isDeleted) => {
      expect(err).toBe(null);
      expect(isDeleted).toBe(true);
      done();
    });
  });
});
