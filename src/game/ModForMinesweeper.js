const Mod = require("discord-plays-base/src/game/Mod");

class ModForMinesweeper extends Mod {
  constructor(id, name, minesweeper) {
    super(id, name, minesweeper);

    var $t = this;
    this.mines = {
      add: (mine) => {
        mine.id = `${$t.id}.${mine.id}`;
        $t.project.addMine($t, mine);
        return mine;
      },
    };
    this.boards = {
      add: (board) => {
        board.id = `${$t.id}.${board.id}`;
        $t.project.addBoard($t, board);
      },
    };
  }
}

module.exports = ModForMinesweeper;
