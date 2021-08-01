const Mod = require('../../game/Mod');
const ZeroMine = require('./ZeroMine');

class Base extends Mod {
  constructor(ms) {
    super("discordplaysminesweeper.zero","Zero",ms);
    this.mines.add(new ZeroMine());
  }
}

module.exports = Base;
