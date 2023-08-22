const Mine = require('../../game/Mine');

class NumberMultiplyMine extends Mine {
  constructor(name, value) {
    super("multiply-"+value, name, 0);
    this.alias = [name, 'x'+value];
    this.value = value;
  }

  calculateValue(a) {
    return a * this.value;
  }

  affectedCells(x, y) {
    return this.default3x3Box(x, y);
  }

  async getMineTexture(texturepack) {
    return await texturepack.getTexture(`${this.mod.id}/mines/${this.value}`);
  }

  async getFlagTexture(texturepack) {
    return await texturepack.getTexture(`${this.mod.id}/flags/${this.value}`);
  }
}

module.exports = NumberMultiplyMine;
