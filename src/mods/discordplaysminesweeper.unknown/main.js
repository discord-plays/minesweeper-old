const ModForMinesweeper = require("../../game/ModForMinesweeper");
const ZeroMine = require("./ZeroMine");
const MagneticMine = require("./MagneticMine");

class Base extends ModForMinesweeper {
  constructor(ms) {
    super("discordplaysminesweeper.unknown", "Unknown", ms);
    this.mines.add(new ZeroMine());
    this.mines.add(new MagneticMine());
  }
}

module.exports = Base;
