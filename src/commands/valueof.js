const Discord = require("discord.js");

function valueofCommand(bot, guildId, channelId, replyFunc, args) {
  var boardId = guildId + "-" + channelId;
  if (bot.isBoard(boardId)) {
    var board = bot.getBoard(boardId);
    let cells = [];
    for (var i = 0; i < args.length; i++) {
      if (args[i] === null) continue;
      var cellPos;
      try {
        cellPos = board.cellA1ToIndex(args[i]);
      } catch (err) {
        throw new Error(`Error: Cell \`${args[i]}\` is invalid, command execution stopped!`);
      }
      var cell = board.get(cellPos.col, cellPos.row);
      if(cells.length > 25) throw new Error("Error: You can't view the values of more than 25 cells in a single command");
      cells.push([args[i], cellPos, cell]);
    }

    var embed = new Discord.MessageEmbed()
      .setColor("#15d0ed")
      .setAuthor("Minesweeper!", bot.jsonfile.logoQuestion)
      .setTitle("Value Of")
      .setDescription(cells.map(x=>`${x[0]}: ${(x[2].flagged || !x[2].visible) ? "?" : (x[2].number == Number.MAX_SAFE_INTEGER ? "" : x[2].number)}`).join('\n'));
    replyFunc.reply({
      embeds:[embed],
      ephemeral:true
    });
  } else {
    return bot.sendMissingGame(replyFunc, guildId);
  }
}

function valueofMessage(bot, msg, args = []) {
  if (args.length < 1) return bot.sendInvalidOptions('valueof', msg);
  [guildId, channelId] = [msg.guild == null ? "dm" : msg.guild.id, msg.channel.id];
  valueofCommand(bot, guildId, channelId, {reply:a=>{
    if(typeof(a)==="string") a = {content:a};
    if(!a.hasOwnProperty("allowedMentions")) a.allowedMentions = {};
    a.allowedMentions.repliedUser = false;
    return msg.reply(a);
  }}, args);
}

function valueofInteraction(bot, interaction) {
  [guildId, channelId] = [interaction.guild == null ? "dm" : interaction.guild.id, interaction.channel.id];
  let data=interaction.options.getString("data").split(' ');
  valueofCommand(bot, guildId, channelId, interaction, data);
}

var helpExample = [
  "`>valueof <A1> [B2] [AA5]`",
  "`>valueof A1 B2 AA5`",
  "`>valueof a5`"
];
var helpText = [
  "View value of a cell in the current board"
];
var valueofOptions = [{
  name: 'data',
  type: 'STRING',
  description: 'The cells to view the value of (e.g. A1 B2 C3)',
  required: true
}];

module.exports = {
  messageCommand: valueofMessage,
  interactionCommand: valueofInteraction,
  help: helpText,
  example: helpExample,
  options: valueofOptions
};
