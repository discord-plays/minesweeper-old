const Discord = require("discord.js");

function creditsCommand(bot, msg, args = []) {
  var embed = new Discord.MessageEmbed()
    .setColor("#15d0ed")
    .setAuthor("Minesweeper!", bot.jsonfile.logoQuestion)
    .setTitle("Credits")
    .addFields(bot.CREDITS);
  msg.channel.send(embed);
}

var helpExample = [
  "`>credits`"
];

var helpText = [
  "Thanks to all these people for working on the bot"
];

module.exports = {
  command: creditsCommand,
  help: helpText,
  example: helpExample
};
