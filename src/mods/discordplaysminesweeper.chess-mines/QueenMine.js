const Mine = require('../../game/Mine');

class QueenMine extends Mine {
  constructor() {
    super("queen", "Queen", 0);
    this.alias = ["queen"];
  }

  calculateValue(a) {
    return a + 1;
  }

  affectedCells(x, y, w, h) {
    return this.mergeBoxes(this.plusBox(x, y, w, h), this.diagonalBox(x, y, w, h));
  }

  async getMineTexture(texturepack) {
    return await texturepack.getTexture(`${this.mod.id}/mines/queen`);
  }

  async getFlagTexture(texturepack) {
    return await texturepack.getTexture(`${this.mod.id}/flags/queen`);
  }
}

module.exports = QueenMine;
