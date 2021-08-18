function unflagCommand(bot, guildId, channelId, userId, replyFunc, args) {
  let boardId = `${guildId}-${guildId == "dm" ? userId : channelId}`;
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
      if(cell.flagged) cell.flag = null;
      cell.visible = cell.flagged;
    }
    board.save();
    board.displayBoard(replyFunc);
  } else {
    return bot.sendMissingGame(replyFunc, guildId);
  }
}

function unflagMessage(bot, msg, args = []) {
  if (args.length < 1) return bot.sendInvalidOptions('unflag', msg);
  [guildId, channelId] = [msg.guild == null ? "dm" : msg.guild.id, msg.channel.id];
  unflagCommand(bot, guildId, channelId, msg.author.id, {reply:a=>{
    if(typeof(a)==="string") a = {content:a};
    if(!a.hasOwnProperty("allowedMentions")) a.allowedMentions = {};
    a.allowedMentions.repliedUser = false;
    return msg.reply(a);
  }}, args);
}

function unflagInteraction(bot, interaction) {
  [guildId, channelId] = [interaction.guild == null ? "dm" : interaction.guild.id, interaction.channel.id];
  let data=interaction.options.getString("data").split(' ');
  unflagCommand(bot, guildId, channelId, interaction.user.id, interaction, data);
}

var helpExample = [
  "`>unflag <A1> [B2]`",
  "`>unflag B3 C2`"
];
var helpText = [
  "Unflag a cell in the current board"
];
var flagOptions = [{
  name: 'data',
  type: 'STRING',
  description: 'The cells to unflag (e.g. A1 B2 C3)',
  required: true
}];

module.exports = {
  messageCommand: unflagMessage,
  interactionCommand: unflagInteraction,
  help: helpText,
  example: helpExample,
  options: flagOptions
};
