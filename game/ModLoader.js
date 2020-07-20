const Globber = require("./Globber")

class ModLoader extends Globber {
  constructor(basedir) {
    super(path.join(basedir, 'mods'), '*/');
    this.mods = [];
  }

  error(err) {
    console.error("Error loading assets");
    console.error(err);
  }

  import(path) {
    this.mods.push(new Mod(path));
  }

  find(name) {
    var z = this.mods.filter(x => x.name == name);
    if (z.length != 1) return null;
    return z[0];
  }

  load() {
    this.mods.forEach(mod=>{
      mod.load();
    })
  }

  unload() {
    this.mods.forEach(mod=>{
      mod.unload();
    })
  }
}

module.exports = ModLoader;