const Mod = require('../../game/Mod');
const ZeroMine = require('./ZeroMine');
const MagneticMine = require('./MagneticMine');

class Base extends Mod {
  constructor(ms) {
    super("discordplaysminesweeper.unknown","Unknown",ms);
    this.mines.add(new ZeroMine());
    this.mines.add(new MagneticMine());
  }
}

module.exports = Base;
