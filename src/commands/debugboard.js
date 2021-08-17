function debugboardCommand(bot, msg, args = []) {
  if (!bot.DEBUG) return;
  if (args.length > 0) return bot.sendInvalidOptions("debugboard", msg);
  [guildId, channelId] = [msg.guild == null ? "dm" : msg.guild.id, msg.channel.id];
  var boardId = guildId + "-" + channelId;
  if (bot.isBoard(boardId)) {
    var board = bot.getBoard(boardId);
    var w = board.width;
    var h = board.height;
    var c = [];
    for (var i = 0; i < h; i++) {
      for (var j = 0; j < w; j++) {
        let cell = board.get(j,i);
        if(cell.extra == "#") continue;
        if(cell.number == Number.MAX_SAFE_INTEGER && !cell.flagged && !cell.mined) continue;
        c.push(fancyPrint(j + 1, i + 1, cell));
      }
    }

    let v=c.join("\n");
    (async function() {
      while(v.length>0) {
        let z=v.substr(0,2000);
        v=v.substr(2000,v.length-1);
        ({reply:a=>{
          if(typeof(a)==="string") a = {content:a};
          if(!a.hasOwnProperty("allowedMentions")) a.allowedMentions = {};
          a.allowedMentions.repliedUser = false;
          return msg.reply(a);
        }}).reply(z);
      }
    })();
  }
}

function fancyPrint(i, j, cell) {
  return `X: ${i} Y: ${j} Mine: ${cell.mined ? cell.mine.id : null} Flag: ${cell.flagged ? cell.flag.id : null} Number: ${cell.number} Visible: ${cell.visible} Extra: ${cell.extra}`;
}

var helpExample = [
  "`>debugboard`"
];

var helpText = [
  "Enable board debug mode"
];

module.exports = {
  messageCommand: debugboardCommand,
  debugOnly: true,
  help: helpText,
  example: helpExample
};
