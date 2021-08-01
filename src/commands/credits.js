const Discord = require("discord.js");
const { version } = require('../../package.json');

function creditsCommand(bot, replyFunc) {
  var embed = new Discord.MessageEmbed()
    .setColor("#15d0ed")
    .setAuthor(`Discord Plays Minesweeper (v${version})`, bot.jsonfile.logoQuestion)
    .setTitle("Credits")
    .addFields(bot.CREDITS);
  replyFunc.reply({embeds:[embed]});
}

function creditsMessage(bot, msg, args = []) {
  if (args.length > 0) return bot.sendInvalidOptions("credits", msg);
  creditsCommand(bot, msg);
}

function creditsInteraction(bot, interaction) {
  creditsCommand(bot, interaction);
}

var helpExample = [
  "`>credits`"
];

var helpText = [
  "Thanks to all these people for working on the bot"
];

module.exports = {
  messageCommand: creditsMessage,
  interactionCommand: creditsInteraction,
  help: helpText,
  example: helpExample
};
