function debugboardCommand(bot, guildId, channelId) {
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

    let v=c.join("\n");
    (async function() {
      while(v.length>0) {
        let z=v.substr(0,2000);
        v=v.substr(2000,v.length-1);
        let chan = await board.getChannel();
        chan.send(z);
      }
    })();
  }
}

function fancyPrint(i, j, cell) {
  return `X: ${i} Y: ${j} Mine: ${cell.mine} Flag: ${cell.flag} Number: ${cell.number} Visible: ${cell.visible}`;
}

function debugboardMessage(bot, msg, args = []) {
  if (!bot.DEBUG) return;
  if (args.length > 0) return bot.sendInvalidOptions("debugboard", msg);
  [guildId, channelId] = [msg.guild == null ? "dm" : msg.guild.id, msg.channel.id];
  debugboardCommand(bot, guildId, channelId);
}

function debugboardInteraction(bot, interaction) {
  if (!bot.DEBUG) return;
  if (args.length > 0) return bot.sendInvalidOptions("debugboard", msg);
  [guildId, channelId] = [interaction.guild == null ? "dm" : interaction.guild.id, interaction.channel.id];
  debugboardCommand(bot, guildId, channelId);
}

var helpExample = [
  "`>debugboard`"
];

var helpText = [
  "Enable board debug mode"
];

module.exports = {
  messageCommand: debugboardMessage,
  interactionCommand: debugboardInteraction,
  debugOnly: true,
  help: helpText,
  example: helpExample
};
