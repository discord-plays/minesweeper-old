class Mod {
  constructor(id, name, minesweeper) {
    this.id = id;
    this.name = name;
    this.minesweeper = minesweeper;
    var $t=this;
    this.mines = {add: mine => {
      mine.id = `${$t.id}.${mine.id}`;
      this.minesweeper.addMine($t,mine);
      return mine;
    }};
  }
}

module.exports = Mod;
