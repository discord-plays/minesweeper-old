const Mod = require('../../game/Mod');
const FBoard = require('./FBoard');

class Base extends Mod {
  constructor(ms) {
    super("discordplaysminesweeper.f","F",ms);
    this.boards.add(FBoard);
  }
}

module.exports = Base;
