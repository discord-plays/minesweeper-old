const ModForMinesweeeper = require("../../game/ModForMinesweeper");

class Base extends ModForMinesweeeper {
  constructor(ms) {
    super("discordplays.base", "Base", ms);
  }
}

module.exports = Base;
