# Node User Settings

A universal but simple node library to implement user settings, but originally built to work with Electron.js.

- Synchronous functions
- Asynchronous functions
- Callback-based functions

All of them are available for use !

_Hey ! *Node User Settings* needs stars on the main repository on Github, please star the project [repository](https://github.com/noahweasley/Node-User-Settings.git), if you like this little package and are using it. Also don't forget to follow me [Noah](https://github.com/noahweasley). Thank you_

## Installation and API Usage

---

### Installation

---

```
npm i node-user-settings --save
```

## API Usage

---

### Please Note

- For now, callback-based methods naming are weird, I know. I am going to fix it in a major release; in the future.

- You can specify an optional filename in which settings would be saved or retrieved. An optional filename isn't required and can be left blank.

- A new preference file would be created after using the `optionalFileName` argument, with the persisted preference in it.

- Adding a sync as suffix to the promise-based functions, provides you with it's synchronous alternatives.

- `preferenceFileName` is now deprecated as of v1.1.0 and you should use, `fileName` and `fileExt` instead to set the file name to be used to save settings. This small addition would be used in the future and might not be useful for now. But it is highly recommended to stop using `preferenceFileName` for future versions, because it would be removed soon.

- Leaving `fileExt` config option blank but setting a `fileName`, results in a file with the `.json` file extension.

- It is recommended that you only initialize the API once and then pass the initialized instance around using **Dependency Injection**. Even though you don't do this, it's still possible that the API would work as you want because Node JS automatically caches a module after **requiring** them. But again, I wouldn't recommend you do that!

## Setup and Initialization

---

```javascript
const settings = require("node-user-settings)([options]);
```

### Options

#### Type: `Object`

### Keys

#### `preferenceFileName` (deprecated)

The filename (with extension) used to persist preference

#### `preferenceFileDir`

The directory used to persist preference

#### `fileName`

The file name (without extension) used to persist preference

#### `fileExt`

The file extension of the file used to persist preference

**Example**

```javascript
// preferenceFileName is optional, it defaults to a Settings.json file

const settings = require("node-user-settings")({
  preferenceFileDir: "path/to/save/preference",
  preferenceFileName: "Settings.json",
  fileName: "Settings",
  fileExt: "json"
});

// the *Settings* variable in which the module was imported and stored, is what would be used to call the following methods listed
```

For Electron Users

```javascript
// preferenceFileName is optional, it defaults to a Settings.json file

const { app } = require("electron");
const { join } = require("path");

const settings = require("node-user-settings")({
  /* this is the recommended path to persist preference */
  preferenceFileDir: join(app.getPath("userData"), "User", "Preferences"),
  preferenceFileName: "Settings.json",
  fileName: "Settings",
  fileExt: "json"
});

// the *Settings* variable in which the module was imported and stored, is what would be used to call the following methods listed
```

## General Utility Method

---

### ` getDefaultPreferenceFilePath()`

Gets the default save path to the preference

#### Returns

_A String_. The default save path to the preference

**Example**

```javascript
const path = settings.getDefaultPreferenceFilePath();
console.log(path);
```

### ` setDefaultPreferenceFilePath(filePath)`

Sets the default save path to the preference.

_Note_: This method is synchronous, and it is to be used in initialization only. Even though you tried to re-set the default save path, it would throw an error, so you should use it to explicitly set the default preference file path immediately after importing or _requiring_ the module

### Parameter

---

### filePath

#### Type: `String`

The file path to save preference

#### Returns

_A String_. The default save path to the preference

**Example**

```javascript
const path = settings.setDefaultPreferenceFilePath("path/to/save/preference");
console.log(path);
```

## Promise-based Method

---

### `getState(key, defaultValue, optionalFileName)`

Gets a value asynchronously

### Parameter

---

### key

#### Type: `String`

The key in the preference in which it's value would be retrieved

### optionalFileName

#### Type:`String`

An optional filename used to persist the settings. This can be left _null_

### defaultValue

#### Type: `String`

A default value to be used if that key has never been set

#### Returns

_Promise that resolves to a string_. The value which was mapped to the key specified

**Example**

```javascript
const value = await settings.getState("key", "a-default-value" optionalFileName);
console.log(value);
```

### `setState(key, value, optionalFileName)`

Sets a value asynchronously

### Parameter

---

### key

#### Type: `String`

The key in the preference in which it's value would be retrieved

### value

#### Type: `String`

The value to be set and mapped to the key

### optionalFileName

#### Type: `String`

An optional filename used to persist the settings. This can be left _null_

#### Returns

_Promise that resolves to a Boolean_. indicating if the operation was successful or not

**Example**

```javascript
const isSet = await settings.setState("key", "value", optionalFileName);
console.log(`Is value set: ${isSet}`);
```

### `setStates(states, optionalFileName)`

Sets multiple value simultaneously and asynchronously

### Parameter

---

### states

#### Type: `Object`

A map with the key-value pair to be persisted

### optionalFileName

#### Type: `String`

An optional filename used to persist the settings. This can be left _null_

#### Returns

_A Promise that resolves an Array_. A list of all the values that were persisted / set

**Example**

```javascript
// the states to be persisted
const map = {
  moduleName: "node-user-settings",
  version: "1.0.0",
  author: "noahweasley"
};

let persisted = await settings.setStates(map, optionalFileName);
console.log(`This values were set: ${Array.toString(persisted)}`);
```

### `getStates(states, optionalFileName)`

Gets multiple value simultaneously and asynchronously

### Parameter

---

### states

#### Type: `Array`

An array of keys of which values would be retrieved

### optionalFileName

#### Type: `String`

An optional filename used to persist the settings. This can be left _null_

#### Returns

_A Promise that resolves an Array_. A list of all the values that were retrieved

**Example**

```javascript
// the states to be retrieved
let states = ["key1", "key2", "key3"];
let [value1, value2, value3] = await settings.getStates(states, optionalFileName);
```

### `hasKey(key, optionalFileName)`

Asynchronously checks if a key exists

### Parameter

---

### key

#### Type: `String`

The key in the preference in which it's value would be checked for it's existence

### optionalFileName

#### Type: `String`

An optional filename used to do the check. This can be left _null_

#### Returns

_Promise that resolves to a Boolean_. indicating if the key exists in the persisted preference

**Example**

```javascript
let hasKey = await settings.hasKey("key", optionalFileName);
console.log(`Is this key available: ${hasKey ? `YES` : `NO`}`);
```

### `deleteKey(key, optionalFileName)`

Asynchronously deletes a single entry

### Parameter

---

### key

#### Type: `String`

The key in the preference in which it's value would be deleted

### optionalFileName

#### Type: `String`

An optional filename used to persist the settings. This can be left _null_

#### Returns

_Promise that resolves to a Boolean_. indicating if the key was successfully deleted

**Example**

```javascript
let isDeleted = await settings.deleteKey("key", optionalFileName);
console.log(`Is key deleted? ${isDeleted ? `YES` : `NO`}`);
```

### `deleteFile(optionalFileName)`

Asynchronously deletes the preference file

### Parameter

---

### optionalFileName

#### Type: `String`

An optional filename in which the corresponding file would be deleted. This can be left _null_

#### Returns

_Promise that resolves to a Boolean_. indicating if the file was successfully deleted

**Example**

```javascript
let isDeleted = await settings.deleteFile(optionalFileName);
console.log(`Is file deleted? ${isDeleted ? `YES` : `NO`}`);
```

### `serialize(preferenceOb, optionalFileName)`

Asynchronously replaces all data in preference

### Parameter

---

### preferenceOb

#### Type: `Object`

A JSON object to be serialized and persisted

### optionalFileName

#### Type: `String`

An optional filename used to persist the settings. This can be left _null_

#### Returns

_A Boolean_. indicating if it was persisted successfully

**Example**

```javascript
const mockData = {
  moduleName: "node-user-settings",
  version: "1.0.0",
  author: "noahweasley"
};

const isPersisted = await settings.serialize(mockData, optionalFileName);
console.log(`Is data changed ? ${isPersisted ? `YES` : `NO`}`);
```

### `deserialize(optionalFileName)`

Asynchronously retrieves all the data in preference

### Parameter

---

### optionalFileName

#### Type: `String`

An optional filename used to persist the settings. This can be left _null_

#### Returns

_Promise that resolves to A String_. The persisted object as it exists in preference

**Example**

```javascript
const data = await settings.deserialize(optionalFileName);
console.log(data);
```

## Callback-based Method

---

### `getState_c(key, defaultValue, optionalFileName, callbackfn)`

Gets a value asynchronously

### Parameter

---

### key

#### Type: `String`

The key in the preference in which it's value would be retrieved

### defaultValue

#### Type: `String`

A default value to be used if that key has never been set

### optionalFileName

#### Type: `String`

An optional filename used to persist the settings. This can be left _null_

### callbackfn

#### Type: `Function`

A Node-Js qualified callback with any error that occurred as the first argument and a String; the value which was mapped to the key specified

**Example**

```javascript
settings.getState_c("key", "a-default-value", optionalFileName, function (err, value) {
  if (err) console.log(err);
  else console.log(value);
});
```

### `setState_c(key, value, optionalFileName, callbackfn)`

Sets a value asynchronously

### Parameter

---

### key

#### Type: `String`

The key in the preference in which it's value would be set

### value

#### Type: `String`

The value to be set and mapped to the key

### optionalFileName

#### Type: `String`

An optional filename used to persist the settings. This can be left _null_

### callbackfn

#### Type: `Function`

A Node-Js qualified callback with any error that occurred as the first argument and a Boolean; indicating if the operation was successful or not

**Example**

```javascript
settings.setState_c("key", "value", optionalFileName, function (err, isSet) {
  if (err) console.error(err);
  else console.log(`Is value set: ${isSet}`);
});
```

### `setStates_c(states, optionalFileName, callbackfn)`

Sets multiple value simultaneously and asynchronously

### Parameter

---

### states

#### Type: `Object`

A map with the key-value pair to be persisted

### optionalFileName

#### Type: `String`

An optional filename used to persist the settings. This can be left _null_

### callbackfn

#### Type: `Function`

A Node-Js qualified callback with any error that occurred as the first argument and an Array; a list of all the values that were persisted / set

**Example**

```javascript
// the states to be persisted
const map = {
  moduleName: "node-user-settings",
  version: "1.0.0",
  author: "noahweasley"
};

settings.setStates_c(map, optionalFileName, function (err, persisted) {
  if (err) console.error(err);
  else console.log(`This values were set: ${Array.toString(persisted)}`);
});
```

### `getStates_c(states, optionalFileName, callbackfn)`

Gets multiple value simultaneously and asynchronously

### Parameter

---

### states

#### Type: `Array`

An array of keys of which values would be retrieved

### optionalFileName

#### Type: `String`

An optional filename used to persist the settings. This can be left _null_

### callbackfn

#### Type: `Function`

A Node-Js qualified callback with any error that occurred as the first argument and an Array; list of all the values that were retrieved

**Example**

```javascript
// the states to be retrieved
let states = ["key1", "key2", "key3"];
settings.getStates_c(states, optionalFileName, function (err, values) {
  let [value1, value2, value3] = values;
  // do something with this array of values
});
```

### `hasKey_c(key, optionalFileName, callbackfn)`

Asynchronously checks if a key exists

### Parameter

---

### key

#### Type: `String`

The key in the preference in which it's value would be checked for it's existence

### optionalFileName

#### Type: `String`

An optional filename used to do the check. This can be left _null_

### callbackfn

#### Type: `Function`

A Node-Js qualified callback with any error that occurred as the first argument and a Boolean; indicating if the key exists in the persisted preference

**Example**

```javascript
settings.hasKey_c("key", optionalFileName, function (err, hasKey) {
  if (err) console.error(err);
  else console.log(`Is this key available: ${hasKey ? `YES` : `NO`}`);
});
```

### `deleteKey_c(key, optionalFileName, callbackfn)`

Asynchronously deletes a single entry

### Parameter

---

### key

#### Type: `String`

The key in the preference in which it's value would be deleted

### optionalFileName

#### Type: `String`

An optional filename used to persist the settings. This can be left _null_

### callbackfn

#### Type: `Function`

A Node-Js qualified callback with any error that occurred as the first argument and a Boolean; indicating if the key was successfully deleted

**Example**

```javascript
settings.deleteKey_c("key", optionalFileName, function (err, isDeleted) {
  if (err) console.error(err);
  else console.log(`Is key deleted? ${isDeleted ? `YES` : `NO`}`);
});
```

### `deleteFile_c(optionalFileName, callbackfn)`

Asynchronously deletes the preference file

### Parameter

---

### optionalFileName

#### Type: `String`

An optional filename in which the corresponding file would be deleted. This can be left _null_

### callbackfn

#### Type: `Function`

A Node-Js qualified callback with any error that occurred as the first argument and a Boolean; if the file was successfully deleted

**Example**

```javascript
settings.deleteFile_c(optionalFileName, function (err, isDeleted) {
  if (err) console.error(err);
  else console.log(`Is file deleted? ${isDeleted ? `YES` : `NO`}`);
});
```

### `serialize_c(preferenceOb, optionalFileName, callbackfn)`

Asynchronously replaces all data in preference

### Parameter

---

### preferenceOb

#### Type: `Object`

A JSON object to be serialized and persisted

### optionalFileName

#### Type: `String`

An optional filename used to persist the settings. This can be left _null_

### callbackfn

#### Type: `Function`

A Node-Js qualified callback with any error that occurred as the first argument and a Boolean; if the file was successfully persisted

**Example**

```javascript
const mockData = {
  moduleName: "node-user-settings",
  version: "1.0.0",
  author: "noahweasley"
};

settings.serialize_c(mockData, optionalFileName, function (err, isPersisted) {
  if (err) console.error(err);
  else console.log(`Is data changed ? ${isPersisted ? `YES` : `NO`}`);
});
```

### `deserialize_c(optionalFileName, callbackfn)`

Asynchronously retrieves all the data in preference

### Parameter

---

### optionalFileName

#### Type: `String`

An optional filename used to persist the settings. This can be left _null_

### callbackfn

#### Type: `Function`

A Node-Js qualified callback with any error that occurred as the first argument and a String; which is the data that was deserialized and retrieved

**Example**

```javascript
settings.deserialize_c(optionalFileName, function (err, data) {
  if (err) console.error(err);
  else console.log(data);
});
```

## Synchronous Method

---

### `getStateSync(key, defaultValue, optionalFileName)`

Gets a value synchronously

### Parameter

---

### key

#### Type: `String`

The key in the preference in which it's value would be retrieved

### defaultValue

The default value to be retrieved if that key has never been set

#### Type: `String`

The key in the preference in which it's value would be retrieved

### optionalFileName

#### Type: `String`

An optional filename used to persist the settings. This can be left _null_

#### Returns

_A String_. The value which was mapped to the key specified

**Example**

```javascript
const value = settings.getStateSync("key", "a-default-value", optionalFileName);
console.log(value);
```

### `setStateSync(key, optionalFileName)`

Sets a value synchronously

### Parameter

---

### key

#### Type: `String`

The key in the preference in which it's value would be retrieved

### value

#### Type: `String`

The value to be set and mapped to the key

### optionalFileName

#### Type: `String`

An optional filename used to persist the settings. This can be left _null_

#### Returns

_A Boolean_. indicating if the operation was successful or not

**Example**

```javascript
const isSet = settings.setStateSync("key", "value", optionalFileName);
console.log(`Is value set: ${isSet}`);
```

### `setStatesSync(states, optionalFileName)`

Sets multiple value simultaneously and synchronously

### Parameter

---

### states

#### Type: `Object`

A map with the key-value pair to be persisted

### optionalFileName

#### Type: `String`

An optional filename used to persist the settings. This can be left _null_

#### Returns

_An Array_. A list of all the values that were persisted / set

**Example**

```javascript
// the states to be persisted
const map = {
  moduleName: "node-user-settings",
  version: "1.0.0",
  author: "noahweasley"
};

let persisted = settings.setStatesSync(map, optionalFileName);
console.log(`This values were set: ${Array.toString(persisted)}`);
```

### `getStatesSync(states, optionalFileName)`

Gets multiple value simultaneously and synchronously

### Parameter

---

### states

#### Type: `Array`

An array of keys of which values would be retrieved

### optionalFileName

#### Type: `String`

An optional filename used to persist the settings. This can be left _null_

#### Returns

_An Array_. A list of all the values that were retrieved

**Example**

```javascript
// the states to be retrieved
let states = ["key1", "key2", "key3"];
let [value1, value2, value3] = settings.getStatesSync(states, optionalFileName);
```

### `hasKeySync(key, optionalFileName)`

Synchronously checks if a key exists

### Parameter

---

### key

#### Type: `String`

The key in the preference in which it's value would be checked for it's existence

### optionalFileName

#### Type: `String`

An optional filename used to do the check. This can be left _null_

#### Returns

_A Boolean_. indicating if the key exists in the persisted preference

**Example**

```javascript
let hasKey = settings.hasKeySync("key", optionalFileName);
console.log(`Is this key available: ${hasKey ? `YES` : `NO`}`);
```

### `deleteKeySync(key, optionalFileName)`

Synchronously deletes a single entry

### Parameter

---

### key

#### Type: `String`

The key in the preference in which it's value would deleted

### optionalFileName

#### Type: `String`

An optional filename used to persist the settings. This can be left _null_

#### Returns

_A Boolean_. indicating if the key was successfully deleted

**Example**

```javascript
let isDeleted = settings.deleteKeySync("key", optionalFileName);
console.log(`Is key deleted? ${isDeleted ? `YES` : `NO`}`);
```

### `deleteFileSync(optionalFileName)`

Synchronously deletes the preference file

### Parameter

---

### optionalFileName

#### Type: `String`

An optional filename in which the corresponding file would be deleted. This can be left _null_

#### Returns

_A Boolean_. indicating if the file was successfully deleted

**Example**

```javascript
let isDeleted = settings.deleteFileSync(optionalFileName);
console.log(`Is file deleted? ${isDeleted ? `YES` : `NO`}`);
```

### `serializeSync(preferenceOb, optionalFileName)`

Synchronously replaces all data in preference

### Parameter

---

### preferenceOb

#### Type: `Object`

A JSON object to be serialized and persisted

### optionalFileName

#### Type: `String`

An optional filename used to persist the settings. This can be left _null_

**Example**

```javascript
const mockData = {
  moduleName: "node-user-settings",
  version: "1.0.0",
  author: "noahweasley"
};

const isPersisted = settings.serializeSync(mockData, optionalFileName);
console.log(`Is data changed ? ${isPersisted ? `YES` : `NO`}`);
```

### `deserializeSync(optionalFileName)`

Synchronously retrieves all the data in preference

### Parameter

---

### optionalFileName

#### Type: `String`

An optional filename used to persist the settings. This can be left _null_

#### Returns

_A String_. The persisted object as it exists in preference

**Example**

```javascript
const data = settings.deserializeSync(optionalFileName);
console.log(data);
```
