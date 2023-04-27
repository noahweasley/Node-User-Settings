# Contributing to the codebase

- Clone the [repository](https://github.com/noahweasley/Node-User-Settings.git) and run `$ npm install && npm test`

- Before running `$ npm test` , make sure you have a `.env` file placed at the root of your project and it should have this declaration

```dosini
# replace values with a valid file path

OPTIONAL_FILENAME="a-proper-file-with-extension"
NODE_USER_SETTINGS_DIRECTORY="directory/to/save/settings/file"
NODE_USER_SETTINGS_FILE_PATH="filename/to/save/settings"
NODE_USER_SETTINGS_OPTIONAL_FILE_PATH="filename/to/save/optional/settings"
```

- After making changes to the APIs, also re-run tests to verify that nothing was broken.

- Open a pull request with your changes to the API

- Wait for a merge

More features are coming up soon :rocket:
