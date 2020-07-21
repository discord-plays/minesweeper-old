const Discord = require("discord.js");

function pineappleCommand(bot, msg, args = []) {
  msg.channel.send(new Discord.RichEmbed()
    .setDescription(":pineapple:"));
}

var helpExample = "`>pineapple`"
var helpText = [
  "Summon pineapple emoji"
];

module.exports = {
  command: pineappleCommand,
  help: helpText,
  example: helpExample
}