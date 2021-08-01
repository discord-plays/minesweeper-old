const Discord = require("discord.js");

function orangeCommand(bot, msg, args = []) {
  if (args.length > 0) return bot.sendInvalidOptions("orange", msg);
  msg.reply("<:orange_wool:871201795752476692>");
}

var helpExample = [
  "`>orange`"
];

var helpText = [
  "Summon orange emoji"
];

module.exports = {
  messageCommand: orangeCommand,
  help: helpText,
  isHidden: true,
  example: helpExample
};
