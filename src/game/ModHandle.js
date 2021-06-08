const path = require("path");

class ModHandle {
  constructor(minesweeper, modfolder) {
    this.minesweeper = minesweeper;
    this.modfolder = modfolder;
    this.name = modfolder.replace(/^.*?\/([^\/]+)\/$/, '$1'); // Regex man
    this.modpath = path.join(this.modfolder, 'main.js');
    this.mod = null;
  }

  load() {
    if (this.mod!=null) return;
    let ModKlass = require(this.modpath);
    this.mod = new ModKlass(this.minesweeper);
  }
}

module.exports = ModHandle;
