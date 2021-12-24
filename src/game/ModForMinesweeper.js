class ModForMinesweeper {
  constructor(id, name, minesweeper) {
    super(id, name, minesweeper);

    var $t = this;
    this.mines = {
      add: (mine) => {
        mine.id = `${$t.id}.${mine.id}`;
        $t.minesweeper.addMine($t, mine);
        return mine;
      },
    };
    this.boards = {
      add: (board) => {
        board.id = `${$t.id}.${board.id}`;
        $t.minesweeper.addBoard($t, board);
      },
    };
  }
}

module.exports = ModForMinesweeper;
