const path = require("path");

class Mod {
  constructor(modfolder) {
    this.modfolder = modfolder;
    this.name = modfolder.replace(/^.*?\/([^\/]+)\/$/, '$1'); // Regex man
    this.modpath = path.join(this.modfolder, this.name + '.js');
  }

  load() {
    console.error("Melon bruh please code this");
  }
  unload() {
    console.error("Melon bruh please code this");
  }
}

module.exports = Mod;