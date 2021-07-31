const Discord = require("discord.js");

function creditsCommand(bot, outChannel) {
  var embed = new Discord.MessageEmbed()
    .setColor("#15d0ed")
    .setAuthor("Minesweeper!", bot.jsonfile.logoQuestion)
    .setTitle("Credits")
    .addFields(bot.CREDITS);
  outChannel.send({embeds:[embed]});
}

function creditsMessage(bot, msg, args = []) {
  if (args.length > 0) return bot.sendInvalidOptions("credits", msg);
  creditsCommand(bot, msg.channel);
}

function creditsInteraction(bot, interaction) {
  creditsCommand(bot, interaction.channel);
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
