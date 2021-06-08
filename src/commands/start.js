const Discord = require("discord.js");
const address = require('../address');

function startCommand(bot, msg, args) {
  bot.web.updateUserLastChannel(msg.author, msg.channel);
  var embed = new Discord.MessageEmbed()
    .setColor("#15d0ed")
    .setAuthor("Minesweeper!", bot.jsonfile.logoQuestion)
    .setTitle("Start game")
    .setDescription([
      `[Open this link to create a board](${address.create})`,
      'If you already have the board creation page open in your browser you can just refresh it instead of opening the page again',
      'Disclaimer: You are required to login using your Discord account. If you are already logged in you can just press authorize to allow Discord Plays Minesweeper to know who you are.'
    ].join('\n'));
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
