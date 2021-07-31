function boardCommand(bot, guildId, channelId) {
  let boardId = guildId + "-" + channelId;
  if (bot.isBoard(boardId)) {
    bot.getBoard(boardId).displayBoard();
  } else {
    return bot.sendMissingGame(msg);
  }
}

function boardMessage(bot, msg, args = []) {
  if (args.length > 0) return bot.sendInvalidOptions("board", msg);
  [guildId, channelId] = [msg.guild == null ? "dm" : msg.guild.id, msg.channel.id];
  boardCommand(bot, guildId, channelId);
}

function boardInteraction(bot, interaction) {
  [guildId, channelId] = [interaction.guild == null ? "dm" : interaction.guild.id, interaction.channel.id];
  boardCommand(bot, guildId, channelId);
}

var helpExample = [
  "`>board`"
];
var helpText = [
  "Shows the current board state in this channel"
];

module.exports = {
  messageCommand: boardMessage,
  interactionCommand: boardInteraction,
  help: helpText,
  example: helpExample
};
