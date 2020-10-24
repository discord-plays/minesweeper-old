function flagCommand(bot, msg, args, _a = true) {
  if (args.length < 1) {
    return bot.sendInvalidOptions('flag', msg);
  }
  [guildId, channelId] = [msg.guild == null ? "dm" : msg.guild.id, msg.channel.id];
  var boardId = guildId + "-" + channelId;
  if (bot.isBoard(boardId)) {
    var board = bot.getBoard(boardId);
    var firstItem = args.shift();
    var currentFlag;
    try {
      currentFlag = board.flagHashToIndex(firstItem);
    } catch (err) {
      throw new Error(`Error: Flag \`${firstItem}\` is invalid, command execution stopped!`);
    }
    for (var i = 0; i < args.length; i++) {
      if (args[i] === null) continue;
      if (args[i][0] == "&") {
        try {
          currentFlag = board.flagHashToIndex(args[i]);
        } catch (err) {
          throw new Error(`Error: Flag \`${args[i]}\` is invalid, command execution stopped!`);
        }
      } else {
        var cellPos;
        try {
          cellPos = board.cellA1ToIndex(args[i]);
        } catch (err) {
          throw new Error(`Error: Cell \`${args[i]}\` is invalid, command execution stopped!`);
        }
        var cell = board.get(cellPos.col, cellPos.row);
        if (cell.visible && !cell.flagged) continue;
        else cell.flag = currentFlag.id;
        cell.visible = cell.flagged;
      }
    }
    board.displayBoard();
  } else {
    return bot.sendMissingGame(msg);
  }
}

var helpExample = [
  "`>flag <&flag name/number> <A1> [B2] [&flag name/number] [AA5]`"
];
var helpText = [
  "Flag a cell in the current board"
];

module.exports = {
  command: flagCommand,
  help: helpText,
  example: helpExample
};