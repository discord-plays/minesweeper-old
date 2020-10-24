function boardCommand(bot, msg, args = []) {
  if (args.length > 0) {
    return bot.sendInvalidOptions("board", msg);
  }
  [guildId, channelId] = [msg.guild == null ? "dm" : msg.guild.id, msg.channel.id];
  var boardId = guildId + "-" + channelId;

  if (bot.isBoard(boardId)) {
    bot.getBoard(boardId).displayBoard();
  } else {
    return bot.sendMissingGame(msg);
  }
}

var helpExample = [
  "`>board`"
];
var helpText = [
  "Shows the current board state in this channel"
];

module.exports = {
  command: boardCommand,
  help: helpText,
  example: helpExample
};