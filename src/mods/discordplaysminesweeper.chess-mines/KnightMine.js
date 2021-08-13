const Mine = require('../../game/Mine');

class KnightMine extends Mine {
  constructor() {
    super("knight", "Knight", 0);
    this.alias = ["knight"];
  }

  calculateValue(a) {
    return a + 1;
  }

  affectedCells(x, y) {
    return [
      // top left corner
      [x - 2, y - 1],
      [x - 1, y - 2],
      // top right corner
      [x + 1, y - 2],
      [x + 2, y - 1],
      // bottom right corner
      [x + 2, y + 1],
      [x + 1, y + 2],
      // bottom left corner
      [x - 1, y + 2],
      [x - 2, y + 1],
    ]
  }

  async getMineTexture(texturepack) {
    return await texturepack.getTexture(`${this.mod.id}/mines/knight`);
  }

  async getFlagTexture(texturepack) {
    return await texturepack.getTexture(`${this.mod.id}/flags/knight`);
  }
}

module.exports = KnightMine;
