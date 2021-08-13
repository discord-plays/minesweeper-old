class Cell {
  constructor(board) {
    this.mine = null;
    this.flag = null;
    this.number = Number.MAX_SAFE_INTEGER;
    this.extra = "";
    this.visible = false;
    this.board = board;
  }

  get flagged() {
    return this.flag != null;
  }

  get mined() {
    return this.mine != null;
  }

  toJSON () {
    return [this.mined ? this.mine.id : null, this.flagged ? this.flag.id : null, this.number == Number.MAX_SAFE_INTEGER ? null : this.number, this.visible, this.extra];
  }
}

module.exports = Cell;
