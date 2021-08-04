function easyMission(startBoard) {
  var data = {
    mines: {
      'discordplaysminesweeper.base.number-1': 10
    },
    board: {
      width: 9,
      height: 9
    }
  };
  startBoard(data);
}

module.exports = {
  command: easyMission,
  description: 'Easy'
};
