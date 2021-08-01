function flagCommand(bot, guildId, channelId, replyFunc, args) {
  var boardId = guildId + "-" + channelId;
  if (bot.isBoard(boardId)) {
    var board = bot.getBoard(boardId);
    var firstItem = args.shift();
    var currentFlag;
    try {
      currentFlag = board.flagHashToIndex(firstItem);
    } catch (err) {
      let o = Object.keys(board.totalMineCounts);
      if(o.length == 1) {
        currentFlag = bot.getFlagById(o[0]);
        args.splice(0,0,firstItem);
      } else throw new Error(`Error: Flag \`${firstItem}\` is invalid, command execution stopped!`);
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
        else cell.flag = currentFlag;
        cell.visible = cell.flagged;
      }
    }
    board.displayBoard(replyFunc);
  } else {
    return bot.sendMissingGame(replyFunc, guildId);
  }
}

function flagMessage(bot, msg, args = []) {
  if (args.length < 1) return bot.sendInvalidOptions('flag', msg);
  [guildId, channelId] = [msg.guild == null ? "dm" : msg.guild.id, msg.channel.id];
  flagCommand(bot, guildId, channelId, msg, args);
}

function flagInteraction(bot, interaction) {
  [guildId, channelId] = [interaction.guild == null ? "dm" : interaction.guild.id, interaction.channel.id];
  let data=interaction.options.getString("data").split(' ');
  flagCommand(bot, guildId, channelId, interaction, data);
}

var helpExample = [
  "`>flag <&flag name/number> <A1> [B2] [&flag name/number] [AA5]`",
  "`>flag &1 A5 D7`",
  "`>flag &double B3 C2`"
];
var helpText = [
  "Flag a cell in the current board"
];
var flagOptions = [{
  name: 'data',
  type: 'STRING',
  description: 'The type of flag and cells to flag (e.g. &1 A1 B2 C3 or &double B3 C2)',
  required: true
}];

module.exports = {
  messageCommand: flagMessage,
  interactionCommand: flagInteraction,
  help: helpText,
  example: helpExample,
  options: flagOptions
};
