const { describe, expect, test, afterAll } = require("@jest/globals");

const settings = require("./index")({
  preferenceFileDir: "C:\\Users\\Noah\\Desktop",
  preferenceFileName: "Settings.json"
});

const OPTIONAL_FILENAME = "UserSettings.json";

afterAll(async () => {
  await settings.deleteFile();
  await settings.deleteFile(OPTIONAL_FILENAME);
});

describe("settings module", () => {
  test("sets a value without optional filename", async () => {
    let isSet = await settings.setState("moduleName", "node-user-settings");
    expect(isSet).toBe(true);
  });

  test("gets a value without optional filename", async () => {
    let value = await settings.getState("moduleName");
    expect(value).toBe("node-user-settings");
  });

  test("sets a value with optional filename", async () => {
    let isSet = await settings.setState("moduleName", "node-user-settings", OPTIONAL_FILENAME);
    expect(isSet).toBe(true);
  });

  test("gets a value with optional filename", async () => {
    let value = await settings.getState("moduleName", OPTIONAL_FILENAME);
    expect(value).toBe("node-user-settings");
  });

  test("set multiple values without optional filename", async () => {
    let persisted = await settings.setStates({
      moduleName: "node-user-settings",
      version: "1.0.0",
      author: "noahweasley"
    });
    expect(persisted).toEqual(["node-user-settings", "1.0.0", "noahweasley"]);
  });

  test("get multiple values without optional filename", async () => {
    let values = await settings.getStates(["moduleName", "version", "author"]);
    expect(values).toEqual(["node-user-settings", "1.0.0", "noahweasley"]);
  });

  test("set multiple values with optional filename", async () => {
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

  test("get multiple values with optional filename", async () => {
    let values = await settings.getStates(["moduleName", "version", "author"], OPTIONAL_FILENAME);
    expect(values).toEqual(["node-user-settings", "1.0.0", "noahweasley"]);
  });

  test("delete a single entry without optional filename", async () => {
    let isDeleted = await settings.deleteKey("author");
    expect(isDeleted).toBe(true);
  });

  test("delete a single entry with optional filename", async () => {
    let isDeleted = await settings.deleteKey("author", OPTIONAL_FILENAME);
    expect(isDeleted).toBe(true);
  });
  
  test("check if a single entry exists without optional filename", async () => {
    let isDeleted = await settings.hasKey("moduleName");
    expect(isDeleted).toBe(true);
  }) 
  
  test("check if a single entry exists with optional filename", async () => {
    let isDeleted = await settings.hasKey("moduleName", OPTIONAL_FILENAME);
    expect(isDeleted).toBe(true);
  })
});
