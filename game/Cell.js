class Cell {
  constructor(board) {
    this.mine = 0;
    this.flag = 0;
    this.number = Number.MAX_SAFE_INTEGER;
    this.visible = false;
    this.board = board;
  }

  get flagged() {
    return this.flag != 0;
  }

  get mined() {
    return this.mine != 0;
  }
}

module.exports = Cell