const settings = require("./index")({
  preferenceFileDir: "C:\\Users\\Noah\\Desktop"
});

(async function main() {
  settings.setState("name", "Noah Weasley");
  console.log("Successfully set !!");

  console.log(`Sucessfully got: ${await settings.getStates(["first-name"])}`);
})();
