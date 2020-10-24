function debugboardCommand(bot, msg, args = []) {
  if (!bot.DEBUG) return;
  [guildId, channelId] = [msg.guild == null ? "dm" : msg.guild.id, msg.channel.id];
  var boardId = guildId + "-" + channelId;
  if (bot.isBoard(boardId)) {
    var board = bot.getBoard(boardId);
    var w = board.width;
    var h = board.height;
    var c = [];
    for (var i = 0; i < h; i++) {
      for (var j = 0; j < w; j++) {
        c.push(fancyPrint(j + 1, i + 1, board.get(j, i)));
      }
    }
    msg.channel.send(c.join("\n"));
  }
}

function fancyPrint(i, j, cell) {
  return `X: ${i} Y: ${j} Mine: ${cell.mine} Flag: ${cell.flag} Number: ${cell.number} Visible: ${cell.visible}`;
}

var helpExample = [
  "`>debugboard`"
];

var helpText = [
  "Enable board debug mode"
];

module.exports = {
  command: debugboardCommand,
  debugOnly: true,
  help: helpText,
  example: helpExample
};
