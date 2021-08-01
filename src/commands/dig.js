function digCommand(bot, guildId, channelId, replyFunc, args) {
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
      if (cell.flagged) throw new Error("Error: You can't dig a flagged cell");
      if (cell.visible) continue;
      if (cell.mined) {
        cell.visible = true;
        return board.bombExplode(replyFunc);
      }
      board.floodFill(cellPos.col, cellPos.row);
    }
    if(!board.detectWin(replyFunc)) board.displayBoard(replyFunc);
  } else {
    return bot.sendMissingGame(replyFunc, guildId);
  }
}

function digMessage(bot, msg, args = []) {
  if (args.length < 1) return bot.sendInvalidOptions('dig', msg);
  [guildId, channelId] = [msg.guild == null ? "dm" : msg.guild.id, msg.channel.id];
  digCommand(bot, guildId, channelId, msg, args);
}

function digInteraction(bot, interaction) {
  [guildId, channelId] = [interaction.guild == null ? "dm" : interaction.guild.id, interaction.channel.id];
  let data=interaction.options.getString("data").split(' ');
  digCommand(bot, guildId, channelId, interaction, data);
}

var helpExample = [
  "`>dig <A1> [B2] [AA5]`",
  "`>dig A1 B2 AA5`",
  "`>dig a5`"
];
var helpText = [
  "Dig a cell in the current board"
];
var digOptions = [{
  name: 'data',
  type: 'STRING',
  description: 'The cells to dig (e.g. A1 B2 C3)',
  required: true
}];

module.exports = {
  messageCommand: digMessage,
  interactionCommand: digInteraction,
  help: helpText,
  example: helpExample,
  options: digOptions
};
