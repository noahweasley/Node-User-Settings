/**
 * MIT License
 *
 * Copyright (c) 2022 Noah
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 **/

const { requireFunction, validateObject, validateStrings, validateArray } = require("./util");
const { InitializationError, IllegalStateError, UnModifiableStateError } = require("./error");
const Constants = require("./constants");

const path = require("path");
const fsp = require("fs/promises");
const fs = require("fs");

let electron;

function __exports(config = {}) {
  let { preferenceFileDir, preferenceFileName, fileName, fileExt, electronFilePath, useElectronStorage = true } = config;

  let electronStorageErrorCaught = false;
  let defaultPreferenceFilePath, optionalPreferenceFilePath;

  // still provide backward compatibility for electron applications still initializing the storage file path

  if (useElectronStorage) {
    try {
      initializeElectronStorage();
    } catch (err) {
      electronStorageErrorCaught = true;
    }
  } else {
    if ((preferenceFileDir && preferenceFileName) || (preferenceFileDir && fileName && fileExt)) {
      defaultPreferenceFilePath = path.join(
        preferenceFileDir,
        preferenceFileName ? preferenceFileName : `${fileName}.${fileExt || Constants.FILE_EXT}`
      );
    } else if (!preferenceFileDir && preferenceFileName) {
      setDefaultPreferenceFilePath(preferenceFileName);
    }
  }

  function initializeElectronStorage() {
    electron = require("electron");
    let directory = electron.app.getPath("userData");
    let filePath = electronFilePath || path.join("User", "Preferences", "Settings.json");

    setDefaultPreferenceFilePath(path.join(directory, filePath));
  }

  //---------------------------------//
  //           Main APIS             //
  //---------------------------------//

  function getPreferenceFilePath(optionalFileName) {
    // throw error if not initialized
    if (electronStorageErrorCaught) {
      throw new IllegalStateError("Electron storage is used by default, disable this if not running in an Electron app");
    } else if (!defaultPreferenceFilePath) {
      throw new InitializationError("You failed to initialize the preference API, no proper file path was found");
    }

    if (optionalFileName) {
      let joinedPath = path.normalize(path.join(preferenceFileDir, optionalFileName));
      return (optionalPreferenceFilePath = joinedPath);
    } else {
      return path.normalize(defaultPreferenceFilePath);
    }
  }

  /**
   * Sets the flag indicating usage of the default Electron application preferred settings location
   *
   * @param {boolean} value flag to enable storage in the default electron storage folder
   */
  function setUseElectronStorage(value) {
    useElectronStorage = value;
    value && initializeElectronStorage();
  }

  /**
   * Defaults to true to enable all electron applications store preferences at the default preferred location
   *
   * @returns {boolean} true if `useElectronStorage` option or `setUseElectronStorage(true)` was explicitly set
   */
  function isUsingElectronStorage() {
    return useElectronStorage;
  }

  /**
   * Sets the file path to use in Electron applications
   *
   * @param 	{string} 						filePath  the file path to be appended to the preferred electron storage directory. Must point to a valid file with an extension (preferably .json)
   * @throws  {IllegalStateError}   				if electron file storage was not enabled. Might also throw a generic error if not running in an Electron application
   */
  function setElectronFilePath(filePath) {
    if (!isUsingElectronStorage()) {
      throw new IllegalStateError("Electron storage was not enabled or not running in an Electron application");
    }
    electronFilePath = filePath;
    initializeElectronStorage();
  }

  /**
   * @param   {string}  					isAbsolute  flag indicating if the returned path should be absolute or relative
   * @returns {string}        					      the file path to use in Electron applications
   * @throws  {IllegalStateError}   					if electron file storage was not enabled. Might also throw a generic error if not running in an Electron application
   */
  function getElectronFilePath(isAbsolute) {
    if (!isUsingElectronStorage()) {
      throw new IllegalStateError("Electron storage was not enabled or not running in an Electron application");
    }
    return path.normalize(isAbsolute ? path.join(electron.app.getPath("userData"), electronFilePath) : electronFilePath);
  }

  /**
   * Gets the default save path to the preference
   *
   * @returns {string} the default save path to the preference
   */
  function getDefaultPreferenceFilePath() {
    return path.normalize(defaultPreferenceFilePath);
  }

  /**
   * Gets the optional save path to the preference, if an optional file path was previously specified
   *
   * Please note: You mostly never need to use this method at all! Never include it in production code,
   * use only in development mode
   *
   * @returns {string} the temporary save path to the preference
   */
  function getTempPreferenceOptionalFilePath() {
    return path.normalize(optionalPreferenceFilePath);
  }

  /**
   * Sets the default path to the preference file
   *
   * @param   {string}   filePath - the file path to persist preference
   * @returns {string}              the file path to persist preference
   */
  function setDefaultPreferenceFilePath(filePath) {
    validateStrings(filePath);

    if (defaultPreferenceFilePath) {
      throw new UnModifiableStateError("Default Preference file path has already been set and cannot be changed");
    } else {
      try {
        if (!fs.statSync(filePath).isFile()) throw new IllegalStateError(`${filePath} is an invalid path to a file`);
      } catch (err) {
        // throw only my error, isFile() throws error if it can't find the file specified
        if (err instanceof IllegalStateError) throw err;
      }
    }

    preferenceFileDir = path.dirname(filePath);
    // get only file name
    const extname = path.extname(filePath);
    fileExt = extname;
    const basename = path.basename(filePath);
    fileName = basename.substring(0, basename.indexOf(extname));

    return (defaultPreferenceFilePath = filePath);
  }

  /**
   * Asynchronously replaces all data in preference
   *
   * @param 	{JSON}              preferenceOb     - a JSON object to be serialized and persisted
   * @param 	{string}            optionalFileName - an optional filename used to persist the settings. This can be left null
   * @returns {Promise<boolean>}                    a Promise that resolves to a boolean indicating if it was persisted
   */
  async function serialize(preferenceOb, optionalFileName) {
    validateStrings(optionalFileName);
    return await setPreferences(preferenceOb, optionalFileName);
  }

  /**
   * Asynchronously replaces all data in preference
   *
   * @param {JSON}     preferenceOb      - a JSON object to be serialized and persisted
   * @param {string}   optionalFileName  - an optional filename used to persist the settings. This can be left _null_
   * @param {Function} callbackfn        - a Node-Js qualified callback with any IllegalArgumentError that occurred as the first argument and a boolean as the second argument, indicating if the file was successfully persisted
   */
  function serialize_c(preferenceOb, optionalFileName, callbackfn = requireFunction) {
    validateObject(preferenceOb);
    optionalFileName && validateStrings(optionalFileName);
    setPreferencesWithCallback(preferenceOb, optionalFileName, callbackfn);
  }

  /**
   * Synchronously replaces all data in preference
   *
   * @param 	{JSON}     preferenceOb     - a JSON object to be serialized and persisted
   * @param 	{string}   optionalFileName - an optional filename used to persist the settings. This can be left null
   * @returns {boolean}                    true if it was persisted
   */
  function serializeSync(preferenceOb, optionalFileName) {
    validateObject(preferenceOb);
    optionalFileName && validateStrings(optionalFileName);
    return setPreferencesSync(preferenceOb, optionalFileName);
  }

  /**
   * Asynchronously retrieves all the data in preference
   *
   * @param 	{string}            optionalFileName - an optional filename used to persist the settings. This can be left null
   * @returns {Promise<string>}                    a Promise that resolves to the persisted object as it exists in preference
   */
  async function deserialize(optionalFileName) {
    optionalFileName && validateStrings(optionalFileName);
    return JSON.stringify(await getPreferences(optionalFileName));
  }

  /**
   * Synchronously retrieves all the data in preference
   *
   * @param 	{string}   optionalFileName - an optional filename used to persist the settings. This can be left null
   * @returns {string}                    the persisted object as it exists in preference
   */
  function deserializeSync(optionalFileName) {
    optionalFileName && validateStrings(optionalFileName);
    return JSON.stringify(getPreferencesSync(optionalFileName));
  }

  /**
   * Asynchronously retrieves all the data in preference
   *
   * @param {string}   optionalFileName - an  optional filename used to persist the settings. This can be left null
   * @param {Function} callbackfn       - a Node-Js qualified callback with any error that occurred as the first
   *                                      argument and a string as the second argument, representing the data that was deserialized and retrieved
   */
  function deserialize_c(optionalFileName, callbackfn = requireFunction) {
    getPreferencesWithCallback(optionalFileName, callbackfn);
  }

  /**
   * Asynchronously deletes the preference file
   *
   * @param 	{string}            optionalFileName - an optional filename in which the corresponding file would be deleted. This can be left null
   * @returns {Promise<boolean>}                     a Promise that resolves to a boolean, indicating if the file was deleted
   */
  async function deleteFile(optionalFileName) {
    let filePath = getPreferenceFilePath(optionalFileName);

    try {
      await fsp.unlink(filePath);
      return true;
    } catch (err) {
      return false;
    }
  }

  /**
   * Synchronously deletes the preference file
   *
   * @param 	{string}    optionalFileName - an optional filename in which the corresponding file would be deleted. This can be left null
   * @returns {boolean}                 	   a boolean indicating if the file was deleted
   */
  function deleteFileSync(optionalFileName) {
    validateStrings(optionalFileName);
    let filePath = getPreferenceFilePath(optionalFileName);

    try {
      fs.unlinkSync(filePath);
      return true;
    } catch (err) {
      return false;
    }
  }

  /**
   * Asynchronously deletes the preference file
   *
   * @param {string}   optionalFileName - an optional filename in which the corresponding file would be deleted. This can be left null
   * @param {Function} callbackfn       - a Node-Js qualified callback with any error that occurred as the first argument and a boolean as the second argument, indicating if the file was successfully deleted
   */
  function deleteFile_c(optionalFileName, callbackfn = requireFunction) {
    validateStrings(optionalFileName);
    let filePath = getPreferenceFilePath(optionalFileName);
    fs.unlink(filePath, (err) => callbackfn(err, err ? false : true));
  }

  // asynchronously read the preference file from disk and then return an object representation of the file
  async function getPreferences(optionalFileName) {
    optionalFileName && validateStrings(optionalFileName);
    let filePath = getPreferenceFilePath(optionalFileName);

    try {
      let data = await fsp.readFile(filePath, "utf8");
      return JSON.parse(data);
    } catch (err) {
      return createPreferenceFile();
    }

    async function createPreferenceFile() {
      let filehandle;
      try {
        filehandle = await fsp.open(filePath, "wx+");
        await fsp.writeFile(filehandle, "{}", "utf-8");
      } catch (err) {
        if (err.code === "EEXIST") return {};
        else if (err.code === "ENOENT") createPreferenceDirectory(filePath);
        else return {};
      } finally {
        await filehandle?.close();
      }

      async function createPreferenceDirectory() {
        try {
          await fsp.mkdir(preferenceFileDir, {
            recursive: true
          });
          // eslint-disable-next-line no-empty
        } catch (err) {}
      }

      return {};
    }
  }

  // synchronously reads the preference file from disk and then return an object representation of the file
  function getPreferencesSync(optionalFileName) {
    optionalFileName && validateStrings(optionalFileName);
    let filePath = getPreferenceFilePath(optionalFileName);

    try {
      let data = fs.readFileSync(filePath, "utf8");
      return JSON.parse(data);
    } catch (err) {
      return createPreferenceFileSync();
    }

    function createPreferenceFileSync() {
      if (fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, "{}", "utf-8");
        return {};
      } else {
        return createPreferenceDirectorySync();
      }

      function createPreferenceDirectorySync() {
        fs.mkdirSync(preferenceFileDir, { recursive: true });
        return {};
      }
    }
  }

  // asynchronously reads the preference file from disk and then return an object representation of the file
  function getPreferencesWithCallback(optionalFileName, callbackfn = requireFunction) {
    optionalFileName && validateStrings(optionalFileName);

    let filePath = getPreferenceFilePath(optionalFileName);

    fs.readFile(filePath, function (err, data) {
      if (err) {
        return createPreferenceFile(callbackfn);
      } else {
        try {
          callbackfn(null, JSON.parse(data.toString()));
        } catch (err) {
          // try to delete corrupt json file
          deleteFile_c(optionalFileName, (err) => callbackfn(err, {}));
        }
      }
    });

    function createPreferenceFile(callbackfn) {
      fs.open(filePath, "wx+", function (err, fd) {
        if (err /* file not found or some other error occurred */) {
          return createPreferenceDirectory(fd, callbackfn);
        } else {
          fs.writeFile(fd, "{}", { encoding: "utf-8" }, (err) => callbackfn(err, {}));
        }
      });

      // create file directory
      function createPreferenceDirectory(fd, callbackfn) {
        fs.mkdir(filePath, { recursive: true }, function (err) {
          callbackfn(err, {});
          fd?.close();
        });
      }
    }
  }

  // asynchronously writes to file, the JSON object specified by *preferenceOb*
  async function setPreferences(preferenceOb, optionalFileName) {
    validateObject(preferenceOb);
    optionalFileName && validateStrings(optionalFileName);

    let filePath = getPreferenceFilePath(optionalFileName);
    const preference = JSON.stringify(preferenceOb);

    try {
      await fsp.writeFile(filePath, preference, "utf-8");
      return true;
    } catch (err) {
      return false;
    }
  }

  // synchronously writes to file, the JSON object specified by *preferenceOb*
  function setPreferencesSync(preferenceOb, optionalFileName) {
    let filePath = getPreferenceFilePath(optionalFileName);
    const preference = JSON.stringify(preferenceOb);

    try {
      fs.writeFileSync(filePath, preference, "utf-8");
      return true;
    } catch (err) {
      return false;
    }
  }

  // asynchronously writes to file, the JSON object specified by "preferenceOb"
  function setPreferencesWithCallback(preferenceOb, optionalFileName, callbackfn) {
    validateObject(preferenceOb);
    validateStrings(optionalFileName);

    const filePath = getPreferenceFilePath(optionalFileName);
    const preference = JSON.stringify(preferenceOb);

    fs.writeFile(filePath, preference, { encoding: "utf-8" }, (err) => callbackfn(err, err ? false : true));
  }

  /**
   * Asynchronously checks if a key exists
   *
   * @param	  {string}           key              - the key in the preference in which it's value would be checked for it's existence
   * @param 	{string}           optionalFileName - an optional filename used to do the check. This can be left null
   * @returns {Promise<boolean}                     a Promise that resolves to a boolean; indicating if the key exists in the persisted preference
   */
  async function hasKey(key, optionalFileName) {
    validateStrings(key, optionalFileName);

    let preferenceOb = await getPreferences(optionalFileName);
    return Object.keys(preferenceOb).includes(key);
  }

  /**
   * Synchronously checks if a key exists
   *
   * @param 	{string}   key              - the key in the preference in which it's value would be checked for it's existence
   * @param 	{string}   optionalFileName - an optional filename used to do the check. This can be left null
   * @returns {boolean}                     a boolean; indicating if the key exists in the persisted preference
   */
  function hasKeySync(key, optionalFileName) {
    validateStrings(key);
    optionalFileName && validateStrings(optionalFileName);

    let preferenceOb = getPreferencesSync(optionalFileName);
    return Object.keys(preferenceOb).includes(key);
  }

  /**
   * Asynchronously checks if a key exists
   *
   * @param {string}    key               - the key in the preference in which it's value would be checked for it's existence
   * @param {string}    optionalFileName  - an optional filename used to do the check. This can be left null
   * @param {Function}  callbackfn        - a Node-Js qualified callback with any error that occurred as the first argument and a boolean as the second argument, indicating if the key exists in the persisted preference
   */
  function hasKey_c(key, optionalFileName, callbackfn) {
    validateStrings(key);
    optionalFileName && validateStrings(optionalFileName);

    getPreferencesWithCallback(optionalFileName, function (err, preferenceOb) {
      if (err) callbackfn(err);
      else callbackfn(null, Object.keys(preferenceOb).includes(key));
    });
  }

  /**
   * Gets a value asynchronously
   *
   * @param 	{string}            optionalFileName  - an optional filename used to do the check. This can be left null
   * @param 	{string}            key               - the key in the preference in which it's value would be retrieved
   * @param 	{string}            defaultValue      - a default value to be used if that key has never been set
   * @returns {Promise<string>}                     	a Promise that resolves to a string. The value which was mapped to the key specified
   */
  async function getState(key, defaultValue, optionalFileName) {
    validateStrings(key);
    defaultValue && validateStrings(defaultValue);
    optionalFileName && validateStrings(optionalFileName);

    if (await hasKey(key, optionalFileName)) {
      const preferenceOb = await getPreferences(optionalFileName);
      return `${preferenceOb[`${key}`]}`;
    } else {
      // emit promise based result
      return `${defaultValue}`;
    }
  }

  /**
   * Gets a value synchronously
   *
   * @param 	{string}    optionalFileName - an optional filename used to persist the settings. This can be left null
   * @param 	{*}         defaultValue     - the default value to be retrieved if that key has never been set
   * @param 	{string}    key              - an optional filename used to persist the settings. This can be left null
   * @returns {string}                     the value which was mapped to the key specified
   */
  function getStateSync(key, defaultValue, optionalFileName) {
    validateStrings(key);
    defaultValue && validateStrings(defaultValue);
    optionalFileName && validateStrings(optionalFileName);

    // first check if key exists
    if (hasKeySync(key, optionalFileName)) {
      const preferenceOb = getPreferencesSync(optionalFileName);
      return `${preferenceOb[`${key}`]}`;
    } else return `${defaultValue}`;
  }

  /**
   * Gets a value asynchronously
   *
   * @param {string}   key               - the key in the preference in which it's value would be retrieved
   * @param {string}   optionalFileName  - an optional filename used to persist the settings. This can be left _null_
   * @param {*}        defaultValue      - the default value to be retrieved if that key has never been set
   * @param {Function} callbackfn        - a Node-Js qualified callback with any error that occurred as the first argument and a string as the second argument, representing the value which was mapped to the key specified
   */
  function getState_c(key, defaultValue, optionalFileName, callbackfn = requireFunction) {
    validateStrings(key);
    defaultValue && validateStrings(defaultValue);
    optionalFileName && validateStrings(optionalFileName);

    hasKey_c(key, optionalFileName, function (err1, hasKey) {
      if (err1) {
        callbackfn(err1, defaultValue);
      } else if (hasKey) {
        getPreferencesWithCallback(optionalFileName, function (err2, preferenceOb) {
          return callbackfn(err2, `${preferenceOb[`${key}`]}`);
        });
      } else {
        callbackfn(null, `${defaultValue}`);
      }
    });
  }

  /**
   *  Gets multiple value simultaneously and asynchronously
   *
   * @param	  {string}             optionalFileName - an optional filename used to persist the settings. This can be left null
   * @param   {string[]}           states           - an array of keys of which values would be retrieved
   * @returns {Promise<string[]>}                     a Promise that resolves an Array; A list of all the values that were retrieved
   */
  async function getStates(states, optionalFileName) {
    validateStrings(optionalFileName);
    validateArray(states);

    const preferenceOb = await getPreferences(optionalFileName);
    let values = states.map((key) => `${preferenceOb[`${key}`]}`);

    return values;
  }

  /**
   * Gets multiple value simultaneously and synchronously
   *
   * @param 	{string[]}   states           	- an array of keys of which values would be retrieved
   * @param 	{string}     optionalFileName 	- an optional filename used to persist the settings. This can be left null
   * @returns {string[]}                    	a list of all the values that were retrieved
   */
  function getStatesSync(states, optionalFileName) {
    validateStrings(optionalFileName);
    validateArray(states);

    const preferenceOb = getPreferencesSync(optionalFileName);
    let values = states.map((key) => `${preferenceOb[`${key}`]}`);

    return values;
  }

  /**
   * Gets multiple value simultaneously and asynchronously
/   *
   * @param {string}   optionalFileName - optional filename used to persist the settings. This can be left null
   * @param {string[]} states           - an array of keys of which values would be retrieved
   * @param {Function} callbackfn       - a qualified callback function with error as the first argument and an array as the second argument, representing a list of all the values that were retrieved
   */
  function getStates_c(states, optionalFileName, callbackfn = requireFunction) {
    validateStrings(optionalFileName);
    validateArray(states);

    getPreferencesWithCallback(optionalFileName, function (err, preferenceOb) {
      if (err) {
        callbackfn(err);
      } else {
        let values = states.map((key) => `${preferenceOb[`${key}`]}`);
        callbackfn(null, values);
      }
    });
  }

  /**
   * Sets a value synchronously
   *
   * @param {string}    optionalFileName  - an optional filename used to persist the settings. This can be left null
   * @param {string}    key               - the key in the preference in which it's value would be set
   * @param {*}         value             - the value to be set and mapped to the key
   * @returns {boolean}                     true if the operation was successful
   */
  function setStateSync(key, value, optionalFileName) {
    validateStrings(key);
    optionalFileName && validateStrings(optionalFileName);

    let preferenceOb = getPreferencesSync(optionalFileName);

    preferenceOb[`${key}`] = `${value}`;
    return setPreferencesSync(preferenceOb, optionalFileName);
  }

  /**
   * Sets a value asynchronously
   *
   * @param 	{string}             key              - the key in the preference in which it's value would be set
   * @param 	{*}                  value            - the value to be set and mapped to the key
   * @param 	{string}             optionalFileName - an optional filename used to persist the settings. This can be left null
   * @returns {Promise<boolean>}                    	a Promise that resolves to a boolean; indicating if the operation was successful or not
   */
  async function setState(key, value, optionalFileName) {
    validateStrings(key);
    optionalFileName && validateStrings(optionalFileName);

    let preferenceOb = await getPreferences(optionalFileName);
    preferenceOb[`${key}`] = `${value}`;

    return await setPreferences(preferenceOb, optionalFileName);
  }

  /**
   *  Sets a value asynchronously
   *
   * @param {string}    optionalFileName  - an optional filename used to persist the settings. This can be left null
   * @param {string}    key               - the key in the preference in which it's value would be set
   * @param {*}         value             - the value to be set and mapped to the key
   * @param {Function}  callbackfn        - a Node-Js qualified callback with any error that occurred as the first argument and a boolean as the second argument, indicating if the operation was successful or not
   */
  function setState_c(key, value, optionalFileName, callbackfn = requireFunction) {
    validateStrings(key);
    optionalFileName && validateStrings(optionalFileName);

    getPreferencesWithCallback(optionalFileName, function (err, preferenceOb) {
      if (err) {
        callbackfn(err);
      } else {
        preferenceOb[`${key}`] = `${value}`;
        setPreferencesWithCallback(preferenceOb, optionalFileName, callbackfn);
      }
    });
  }

  /**
   * asynchronously sets the states of a user preference using a JSON object containing key-value pairs
   *
   * @param  	{JSON}               states            - a map with the key-value pair to be persisted
   * @param 	{string}             optionalFileName  - an optional filename used to persist the settings. This can be left null
   * @returns {Promise<string[]>}                      a Promise that resolves an Array; list of all the values that were persisted / set
   */
  async function setStates(states, optionalFileName) {
    validateObject(states);
    validateStrings(optionalFileName);

    let preferenceOb = await getPreferences(optionalFileName);
    let inserted = Object.keys(states).map((key) => (preferenceOb[`${key}`] = `${states[`${key}`]}`));

    const isPreferenceSet = await setPreferences(preferenceOb, optionalFileName);
    return isPreferenceSet ? inserted : [];
  }

  /**
   *  Sets multiple value simultaneously and synchronously
   *
   * @param {JSON}       states           - a map with the key-value pair to be persisted
   * @param {String}     optionalFileName - an optional filename used to persist the settings. This can be left null
   * @returns {string[]}                    a list of all the values that were persisted / set
   */
  function setStatesSync(states, optionalFileName) {
    validateStrings(optionalFileName);
    validateObject(states);

    let preferenceOb = getPreferencesSync(optionalFileName);
    let inserted = Object.keys(states).map((key) => (preferenceOb[`${key}`] = `${states[`${key}`]}`));

    return setPreferencesSync(preferenceOb, optionalFileName) ? inserted : [];
  }

  /**
   * Sets multiple value simultaneously and asynchronously
   *
   * @param {JSON}     states           - a map with the key-value pair to be persisted
   * @param {string}   optionalFileName - an optional filename used to persist the settings. This can be left null
   * @param {Function} callbackfn       - a Node-Js qualified callback with any error that occurred as the first argument and an array as the second argument, representing a list of all the values that were persisted / set
   */
  function setStates_c(states, optionalFileName, callbackfn = requireFunction) {
    validateStrings(optionalFileName);
    validateObject(states);

    getPreferencesWithCallback(optionalFileName, function (err1, preferenceOb) {
      if (err1) {
        return callbackfn(err1);
      } else {
        let inserted = Object.keys(states).map((key) => (preferenceOb[`${key}`] = `${states[`${key}`]}`));

        setPreferencesWithCallback(preferenceOb, optionalFileName, function (err2, isInserted) {
          if (isInserted) {
            callbackfn(err2, inserted);
          } else {
            callbackfn(err2);
          }
        });
      }
    });
  }

  /**
   * Asynchronously deletes a single entry
   *
   * @param 	{string}            key               - the key in the preference in which it's value would be deleted
   * @param 	{string}            optionalFileName  - an optional filename used to persist the settings. This can be left null
   * @returns {Promise<boolean>}                    a Promise that resolves to a boolean; indicating if the key was successfully deleted
   */
  async function deleteKey(key, optionalFileName) {
    validateStrings(key, optionalFileName);

    let preferenceOb = await getPreferences(optionalFileName);
    // check if key is present in preference
    if (await hasKey(key, optionalFileName)) {
      delete preferenceOb[`${key}`];
    } else {
      // nothing was deleted, but still return true
      return true;
    }

    return await setPreferences(preferenceOb, optionalFileName);
  }

  /**
   * Synchronously deletes a single entry
   *
   * @param 	{string}    key               - the key in the preference in which it's value would deleted
   * @param 	{string}    optionalFileName  - an optional filename used to persist the settings. This can be left null
   * @returns {boolean}                    	  indicating if the key was successfully deleted
   */
  function deleteKeySync(key, optionalFileName) {
    validateStrings(key, optionalFileName);

    let preferenceOb = getPreferencesSync();
    // check if key is present in preference
    if (hasKeySync(key, optionalFileName)) {
      delete preferenceOb[`${key}`];
    } else {
      // nothing was deleted, but still return true
      return true;
    }

    return setPreferencesSync(preferenceOb, optionalFileName);
  }

  /**
   * Asynchronously deletes a single entry
   *
   * @param {string}    key              - the key in the preference in which it's value would be deleted
   * @param {string}    optionalFileName - an optional filename used to persist the settings. This can be left null
   * @param {Function}  callbackfn       - a Node-Js qualified callback with any error that occurred as the first argument and a boolean as the second argument, indicating if the key was successfully deleted
   */
  function deleteKey_c(key, optionalFileName, callbackfn = requireFunction) {
    validateStrings(key, optionalFileName);

    getPreferencesWithCallback(optionalFileName, function (err1, preferenceOb) {
      if (err1) {
        return callbackfn(err1);
      } else {
        hasKey_c(key, optionalFileName, function (err2, hasKey) {
          if (hasKey) {
            delete preferenceOb[`${key}`];
            callbackfn(err2, true);
          } else {
            // nothing was deleted, but still return true
            callbackfn(err2, true);
          }
        });
      }
    });
  }

  const DICTIONARY = Object.freeze({
    setElectronFilePath,
    setUseElectronStorage,
    isUsingElectronStorage,
    getElectronFilePath,
    getDefaultPreferenceFilePath,
    getTempPreferenceOptionalFilePath,
    setDefaultPreferenceFilePath,
    getState,
    getState_c,
    getStateSync,
    getStates,
    getStatesSync,
    getStates_c,
    setStateSync,
    setState,
    setState_c,
    setStates,
    setStatesSync,
    setStates_c,
    deleteKey,
    deleteKeySync,
    deleteKey_c,
    hasKey,
    hasKeySync,
    hasKey_c,
    serialize,
    serializeSync,
    serialize_c,
    deserialize,
    deserializeSync,
    deserialize_c,
    deleteFile,
    deleteFile_c,
    deleteFileSync
  });

  return DICTIONARY;
}

/**
 * An implementation of the API where options have to be set. `useElectronStorage` option has to be set to false to ensure
 * that an exception is not thrown in non-Electron applications
 *
 * @param 	{JSON}     config - the configuration to be used in initialization
 * @returns {Function}          a function to be used in initialization
 */
module.exports = __exports;

/**
 * A default implementation of the API, options weren't set. `useElectronStorage` option was enabled, disable in non-
 * Electron applications
 *
 * @returns {JSON} the required APIs
 */
module.exports.defaults = __exports();
