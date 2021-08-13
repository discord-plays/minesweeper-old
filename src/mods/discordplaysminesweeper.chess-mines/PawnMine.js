const Mine = require('../../game/Mine');

class PawnMine extends Mine {
  constructor() {
    super("pawn", "Pawn", 0);
    this.alias = ["pawn"];
  }

  calculateValue(a) {
    return a + 1;
  }

  affectedCells(x, y) {
    if(Math.random() >= 0.5) {
      return [
        [x, y-1],   // Forward once
        [x, y-2],   // Forward twice
        [x-1, y-1], // Attack left
        [x+1, y-1], // Attack right
      ];
    } else {
      return [
        [x, y+1],   // Forward once
        [x, y+2],   // Forward twice
        [x-1, y+1], // Attack right
        [x+1, y+1], // Attack left
      ]
    }
  }

  async getMineTexture(texturepack) {
    return await texturepack.getTexture(`${this.mod.id}/mines/pawn`);
  }

  async getFlagTexture(texturepack) {
    return await texturepack.getTexture(`${this.mod.id}/flags/pawn`);
  }
}

module.exports = PawnMine;
