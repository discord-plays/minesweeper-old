function digCommand(bot, msg, args, _a = true) {
  if (args.length < 1) {
    return bot.sendInvalidOptions('dig', msg);
  }
  [guildId, channelId] = [msg.guild == null ? "dm" : msg.guild.id, msg.channel.id];
  var boardId = guildId + "-" + channelId;
  if (bot.isBoard(boardId)) {
    var board = bot.getBoard(boardId);
    for (var i = 0; i < args.length; i++) {
      if (args[i] === null) continue;
      var cellPos;
      try {
        cellPos = board.cellA1ToIndex(args[i]);
      } catch (err) {
        throw new Error(`Error: Cell \`${args[i]}\` is invalid, command execution stopped!`);
      }
      var cell = board.get(cellPos.col, cellPos.row);
      if (cell.visible) return;
      if (cell.flag != 0) throw new Error("Error: You can't dig a flagged cell");
      if (cell.mine != 0) {
        cell.visible = true;
        return board.bombExplode();
      }
      board.floodFill(cellPos.col, cellPos.row);
    }
    if (!board.detectWin()) board.displayBoard();
  } else {
    return bot.sendMissingGame(msg);
  }
}

var helpExample = [
  "`>dig <A1> [B2] [AA5]`"
];
var helpText = [
  "Dig a cell in the current board"
];

module.exports = {
  command: digCommand,
  help: helpText,
  example: helpExample
};