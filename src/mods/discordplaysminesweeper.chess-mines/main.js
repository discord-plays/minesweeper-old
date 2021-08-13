const Mod = require('../../game/Mod');
const PawnMine = require('./PawnMine');
const KnightMine = require('./KnightMine');
const BishopMine = require('./BishopMine');
const RookMine = require('./RookMine');
const QueenMine = require('./QueenMine');
const KingMine = require('./KingMine');

class Base extends Mod {
  constructor(ms) {
    super("discordplaysminesweeper.chess-mines","Chess Mines",ms);
    this.mines.add(new PawnMine());
    this.mines.add(new KnightMine());
    this.mines.add(new BishopMine());
    this.mines.add(new RookMine());
    this.mines.add(new QueenMine());
    this.mines.add(new KingMine());
  }
}

module.exports = Base;
