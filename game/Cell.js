class Cell {
  constructor(board) {
    this.mine = 0
    this.number = 0
    this.visible = false
    this.board = board
  }
}

module.exports = {
  Cell: Cell
}