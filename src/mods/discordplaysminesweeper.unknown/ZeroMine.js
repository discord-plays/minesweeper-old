const Mine = require('../../game/Mine');

class ZeroMine extends Mine {
  constructor() {
    super("number-0", "Zero", 0);
    this.alias = ["Zero", 0];
    this.value = 0;
  }

  calculateValue(a) {
    return a;
  }

  affectedCells(x, y) {
    // I don't think using the default box really matters
    return this.default3x3Box(x, y);
  }

  async getMineTexture(texturepack) {
    return await texturepack.getTexture(`${this.mod.id}/mines/zero`);
  }

  async getFlagTexture(texturepack) {
    return await texturepack.getTexture(`${this.mod.id}/flags/zero`);
  }
}

module.exports = ZeroMine;
