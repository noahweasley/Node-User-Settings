const { describe, expect, test, afterEach, beforeEach } = require("@jest/globals");
const mockData = require("./mock-data.json");
require("dotenv").config();

const settings = require("./index")({
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

describe("Promise-based settings api tests", () => {
  test("asynchronously sets a value without optional filename ( returning a promise )", async () => {
    let isSet = await settings.setState("moduleName", "node-user-settings");
    expect(isSet).toBe(true);
  });

  test("asynchronously gets a value without optional filename ( returning a promise )", async () => {
    let value = await settings.getState("moduleName");
    expect(value).toBe("node-user-settings");
  });

  test("asynchrnousely gets a value without optional filename ( using a callback )", async () => {});

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

  test("synchronously delete a single entry without optional filename", async () => {
    let isDeleted = settings.deleteKeySync("moduleName");
    expect(isDeleted).toBe(true);
  });

  test("synchronously delete a single entry with optional filename", async () => {
    let isDeleted = settings.deleteKeySync("version", OPTIONAL_FILENAME);
    expect(isDeleted).toBe(true);
  });

  test("synchronously check if a single entry exists without optional filename", async () => {
    let hasKey = settings.hasKeySync("version");
    expect(hasKey).toBe(true);
  });

  test("synchronously check if a single entry exists with optional filename", async () => {
    let hasKey = settings.hasKeySync("version", OPTIONAL_FILENAME);
    expect(hasKey).toBe(true);
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

  test("asynchronously gets a value, using callbacks without optional filename", (done) => {
    settings.getState_c("moduleName", null, null, (err, value) => {
      expect(err).toBe(null);
      expect(value).toBe("node-user-settings");
      done();
    });
  });
});
