const Discord = require("discord.js");

function pineappleCommand(bot, msg, args = []) {
  if (args.length > 0) return bot.sendInvalidOptions("pineapple", msg);
  msg.channel.send({embeds:[new Discord.MessageEmbed().setDescription(":pineapple:")]});
}

var helpExample = [
  "`>pineapple`"
];

var helpText = [
  "Summon pineapple emoji"
];

module.exports = {
  messageCommand: pineappleCommand,
  help: helpText,
  isHidden: true,
  example: helpExample
};
