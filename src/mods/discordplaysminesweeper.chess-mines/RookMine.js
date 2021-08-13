const Mine = require('../../game/Mine');

class RookMine extends Mine {
  constructor() {
    super("rook", "Rook", 0);
    this.alias = ["rook"];
  }

  calculateValue(a) {
    return a + 1;
  }

  affectedCells(x, y, w, h) {
    return this.plusBox(x, y, w, h);
  }

  async getMineTexture(texturepack) {
    return await texturepack.getTexture(`${this.mod.id}/mines/rook`);
  }

  async getFlagTexture(texturepack) {
    return await texturepack.getTexture(`${this.mod.id}/flags/rook`);
  }
}

module.exports = RookMine;
