const Mine = require('../../game/Mine');

class NumberAddMine extends Mine {
  constructor(name, value) {
    super("base-number-"+value, name, 0);
    this.value = value;
  }

  calculateValue(a) {
    return a + this.value;
  }

  affectedCells(x, y, width, height) {
    return this.default3x3Box(x, y, width, height);
  }

  getMineTexture(texturepack) {
    return texturepack.getMine(this.value);
  }

  getFlagTexture(texturepack) {
    return texturepack.getFlag(this.value);
  }
}

module.exports = NumberAddMine;
