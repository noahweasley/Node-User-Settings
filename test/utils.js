const { unlink, writeFile } = require("fs/promises");

module.exports.pumpSettings = async function (preferenceFileName, data) {
  return await writeFile(preferenceFileName, JSON.stringify(data));
};

module.exports.deleteSettings = async function (preferenceFileName) {
  return await unlink(preferenceFileName);
};
