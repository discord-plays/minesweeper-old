const ModForMinesweeper = require("../../game/ModForMinesweeper");
const NumberMultiplyMine = require("./NumberMultiplyMine");

class Base extends ModForMinesweeper {
  constructor(ms) {
    super("discordplaysminesweeper.multiply-mines", "Multiply Mines", ms);
    this.mines.add(new NumberMultiplyMine("Multiply Zero", 0));
    this.mines.add(new NumberMultiplyMine("Multiply Single", 1));
    this.mines.add(new NumberMultiplyMine("Multiply Double", 2));
    this.mines.add(new NumberMultiplyMine("Multiply Triple", 3));
    this.mines.add(new NumberMultiplyMine("Multiply Quadruple", 4));
    this.mines.add(new NumberMultiplyMine("Multiply Quintuple", 5));
    this.mines.add(new NumberMultiplyMine("Multiply Sextuple", 6));
    this.mines.add(new NumberMultiplyMine("Multiply Septuple", 7));
    this.mines.add(new NumberMultiplyMine("Multiply Octuple", 8));
    this.mines.add(new NumberMultiplyMine("Multiply Nonuple", 9));
    this.mines.add(new NumberMultiplyMine("Multiply Decuple", 10));
  }
}

module.exports = Base;
