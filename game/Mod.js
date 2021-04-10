class Mod {
  constructor(id, name, minesweeper) {
    this.id = id;
    this.name = name;
    this.minesweeper = minesweeper;
    var $t=this;
    this.mines = {add:mine=>this.minesweeper.addMine($t,mine)};
  }
}

module.exports = Mod;
