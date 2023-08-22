const ModForMinesweeper = require("../../game/ModForMinesweeper");
const Mine = require("../../game/Mine");

class FractionalMines extends ModForMinesweeper {
  constructor(ms) {
    super("discordplaysminesweeper.fractionalmines", "Fractional Mines", ms);
    this.mines.add(new Mine("nothing", "Nothing", 0));
  }
}

module.exports = FractionalMines;
