const Mine = require('../../game/Mine');

class NumberAddMine extends Mine {
  constructor(name, value) {
    super("number-"+value, name, 0);
    this.alias = [name, value];
    this.value = value;
  }

  calculateValue(a) {
    return a + this.value;
  }

  affectedCells(x, y, width, height) {
    return this.default3x3Box(x, y, width, height);
  }

  async getMineTexture(texturepack) {
    return await texturepack.getTexture(`${this.mod.id}/mines/${this.value}`);
  }

  async getFlagTexture(texturepack) {
    return await texturepack.getTexture(`${this.mod.id}/mines/${this.value}`);
  }
}

module.exports = NumberAddMine;
