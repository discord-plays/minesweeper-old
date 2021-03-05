const Discord = require("discord.js");
const address = require('../address');

function startCommand(bot, msg, args) {
  bot.web.updateUserLastChannel(msg.author, msg.channel);
  var embed = new Discord.MessageEmbed()
    .setColor("#15d0ed")
    .setAuthor("Minesweeper!", bot.jsonfile.logoQuestion)
    .setTitle("Start game")
    .setDescription(`To create a board open this link: [Start Game](${address.create})`);
  msg.channel.send(embed);
}

var helpExample = [
  "`>start`"
];

var helpText = [
  "Attempts to start a new board in the current channel"
];

module.exports = {
  command: startCommand,
  help: helpText,
  example: helpExample
};
