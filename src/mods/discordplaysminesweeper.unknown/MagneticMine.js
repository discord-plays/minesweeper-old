const Mine = require('../../game/Mine');

class MagneticMine extends Mine {
  constructor() {
    super("magnetic", "Magnetic", 0);
    this.alias = ["Magnetic", "magnet"];
  }

  calculateExtra(a) {
    return "?";
  }

  calculateValue(a) {
    return a;
  }

  affectedCells(x, y) {
    // I don't think using the default box really matters
    return this.default3x3Box(x, y);
  }

  async getMineTexture(texturepack) {
    return await texturepack.getTexture(`${this.mod.id}/mines/magnetic`);
  }

  async getFlagTexture(texturepack) {
    return await texturepack.getTexture(`${this.mod.id}/flags/magnetic`);
  }
}

module.exports = MagneticMine;
