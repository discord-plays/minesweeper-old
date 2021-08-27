function powerOf2Mission(startBoard) {
  var data = {
    mines: {
      'discordplaysminesweeper.base.number-1': 8,
      'discordplaysminesweeper.base.number-2': 8,
      'discordplaysminesweeper.base.number-4': 8,
      'discordplaysminesweeper.base.number-8': 8
    },
    board: {
      width: 16,
      height: 16
    },
    customBoardId: 'vanilla'
  };
  startBoard(data);
}

module.exports = {
  name: 'Power of 2',
  command: powerOf2Mission,
  description: 'All mines are a power of 2'
};
