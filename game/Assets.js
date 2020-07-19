const path = require("path");
const Globber = require("./Globber");
const Texturepack = require('./Texturepack');

class Assets extends Globber {
  constructor(basedir) {
    super(path.join(basedir, 'assets'), '*.png');
    this.packs = [];
  }

  error(err) {
    console.error("Error loading assets");
    console.error(err);
  }

  import(path) {
    this.packs.push(new Texturepack(path));
  }

  find(name) {
    var z = this.packs.filter(x => x.name == name);
    if (z.length != 1) return null;
    return z[0];
  }
}

module.exports = Assets;