const Globber = require("./Globber")

class Assets extends Globber {
  constructor(basedir) {
    super(basedir);
    this.packs=[];
  }

  error(err) {
    console.error("Error loading assets");
    console.error(err);
  }

  import(path) {
    this.packs.push(new Texturepack(path));
  }
}