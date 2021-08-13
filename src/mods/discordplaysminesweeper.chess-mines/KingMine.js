const Mine = require('../../game/Mine');

class KingMine extends Mine {
  constructor() {
    super("king", "King", 0);
    this.alias = ["king"];
  }

  calculateValue(a) {
    return a + 1;
  }

  affectedCells(x, y) {
    return this.default3x3Box(x, y);
  }

  async getMineTexture(texturepack) {
    return await texturepack.getTexture(`${this.mod.id}/mines/king`);
  }

  async getFlagTexture(texturepack) {
    return await texturepack.getTexture(`${this.mod.id}/flags/king`);
  }
}

module.exports = KingMine;
