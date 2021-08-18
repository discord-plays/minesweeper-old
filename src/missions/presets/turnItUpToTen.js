function turnItUpToTenMission(startBoard) {
  var data = {
    mines: {
      'discordplaysminesweeper.base.number-1': 10,
      'discordplaysminesweeper.base.number-2': 10,
      'discordplaysminesweeper.base.number-3': 10,
      'discordplaysminesweeper.base.number-4': 10,
      'discordplaysminesweeper.base.number-5': 10,
      'discordplaysminesweeper.base.number-6': 10,
      'discordplaysminesweeper.base.number-7': 10,
      'discordplaysminesweeper.base.number-8': 10,
      'discordplaysminesweeper.base.number-9': 10,
      'discordplaysminesweeper.base.number-10': 10
    },
    board: {
      width: 25,
      height: 25
    }
  };
  startBoard(data);
}

module.exports = {
  name: 'Turn It Up To Ten',
  command: turnItUpToTenMission,
  description: 'The mines 1-10 but there are 10 of each'
};
