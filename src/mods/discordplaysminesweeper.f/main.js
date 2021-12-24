const ModForMinesweeper = require("../../game/ModForMinesweeper");
const FBoard = require("./FBoard");

class Base extends ModForMinesweeper {
  constructor(ms) {
    super("discordplaysminesweeper.f", "F", ms);
    this.boards.add(FBoard);
  }
}

module.exports = Base;
