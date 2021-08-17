class Mod {
  constructor(id, name, minesweeper) {
    this.id = id;
    this.name = name;
    this.minesweeper = minesweeper;
    var $t=this;
    this.mines = {add: mine => {
      mine.id = `${$t.id}.${mine.id}`;
      $t.minesweeper.addMine($t,mine);
      return mine;
    }};
    this.boards = {add: board => {
      board.id = `${$t.id}.${board.id}`;
      $t.minesweeper.addBoard($t,board);
    }};
  }
}

module.exports = Mod;
