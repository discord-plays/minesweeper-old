const Mod = require('../../game/Mod');
const NumberAddMine = require('./NumberAddMine');

class Base extends Mod {
  constructor(ms) {
    super("discordplaysminesweeper.base","Base",ms);
    this.mines.add(new NumberAddMine("Single", 1));
    this.mines.add(new NumberAddMine("Double", 2));
    this.mines.add(new NumberAddMine("Triple", 3));
    this.mines.add(new NumberAddMine("Quadruple", 4));
    this.mines.add(new NumberAddMine("Quintuple", 5));
    this.mines.add(new NumberAddMine("Sextuple", 6));
    this.mines.add(new NumberAddMine("Septuple", 7));
    this.mines.add(new NumberAddMine("Octuple", 8));
    this.mines.add(new NumberAddMine("Nonuple", 9));
    this.mines.add(new NumberAddMine("Decuple", 10));
  }
}

module.exports = Base;
