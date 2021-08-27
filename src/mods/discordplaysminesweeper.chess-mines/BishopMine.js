const Mine = require('../../game/Mine');

class BishopMine extends Mine {
  constructor() {
    super("bishop", "Bishop", 0);
    this.alias = ["bishop"];
  }

  calculateValue(a) {
    return a + 1;
  }

  affectedCells(x, y, w, h) {
    return this.diagonalBox(x, y, w, h);
  }

  async getMineTexture(texturepack) {
    return await texturepack.getTexture(`${this.mod.id}/mines/bishop`);
  }

  async getFlagTexture(texturepack) {
    return await texturepack.getTexture(`${this.mod.id}/flags/bishop`);
  }
}

module.exports = BishopMine;
