function boardCommand(bot, guildId, channelId, userId, replyFunc) {
  let boardId = `${guildId}-${guildId == "dm" ? userId : channelId}`;
  if (bot.isBoard(boardId)) {
    bot.getBoard(boardId).displayBoard(replyFunc);
  } else {
    return bot.sendMissingGame(replyFunc, guildId);
  }
}

function boardMessage(bot, msg, args = []) {
  if (args.length > 0) return bot.sendInvalidOptions("board", msg);
  [guildId, channelId] = [msg.guild == null ? "dm" : msg.guild.id, msg.channel.id];
  boardCommand(bot, guildId, channelId, msg.author.id, {reply:a=>{
    if(typeof(a)==="string") a = {content:a};
    if(!a.hasOwnProperty("allowedMentions")) a.allowedMentions = {};
    a.allowedMentions.repliedUser = false;
    return msg.reply(a);
  }});
}

function boardInteraction(bot, interaction) {
  [guildId, channelId] = [interaction.guild == null ? "dm" : interaction.guild.id, interaction.channel.id];
  boardCommand(bot, guildId, channelId, interaction.user.id, interaction);
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
