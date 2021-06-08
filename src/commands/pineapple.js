const Discord = require("discord.js");

function pineappleCommand(bot, msg, args = []) {
  msg.channel.send(new Discord.MessageEmbed()
    .setDescription(":pineapple:"));
}

var helpExample = [
  "`>pineapple`"
];

var helpText = [
  "Summon pineapple emoji"
];

module.exports = {
  command: pineappleCommand,
  help: helpText,
  isHidden: true,
  example: helpExample
};