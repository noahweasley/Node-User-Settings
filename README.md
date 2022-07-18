# Node User Settings

## A simple promise based node settings library, but originally built to work with Electron.js

## Installation and Usage

### Installation

```
npm i node-user-settings --save

```

### Usage Examples

```javascript

const Settings = require('node-user-settings')

// initialize save directory

Settings.initialize({
  dir: 'path/to/save/settings',
})

// get a value
await Settings.getState('key')

// set a key
await Settings.setState('key', 'value')

// use the third argument to specify an optional file name to save the settings
await Settings.setState('key', 'value', optionalFileName)

// set multiple states, but run them sequentially and `states` refers to the number of states saved
let states = await Settings.setStates({
  key1: value1,
  key2: value2,
})

// get multiple states, but run them sequentially
let [value1, value2, value3] = await Settings.getStates([
  'key1',
  'key2',
  'key3',
])

// to use settings and run them in parallel, it's better to use this version
let [res1, res2] = await Promise.all([
  Settings.setState('key', value),
  Settings.setState('key', value),
])

```

More features are to be added soon, features like the synchronous versions of the API and the callback based style
