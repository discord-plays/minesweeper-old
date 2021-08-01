const Discord = require("discord.js");
const address = require('../address');

function startCommand(bot, replyFunc, outChannel, author) {
  bot.web.updateUserLastChannel(author, outChannel);
  var embed = new Discord.MessageEmbed()
    .setColor("#15d0ed")
    .setAuthor("Minesweeper!", bot.jsonfile.logoQuestion)
    .setTitle("Start game")
    .setDescription([
      `[Open this link to create a board](${address.create})`,
      'If you already have the board creation page open in your browser you can just refresh it instead of opening the page again',
      'Disclaimer: You are required to login using your Discord account. If you are already logged in you can just press authorize to allow Discord Plays Minesweeper to know who you are.'
    ].join('\n'));
    replyFunc.reply({embeds:[embed]});
}

function startMessage(bot, msg, args = []) {
  if (args.length > 0) return bot.sendInvalidOptions("start", msg);
  startCommand(bot, msg, msg.channel, msg.author);
}

function startInteraction(bot, interaction) {
  startCommand(bot, interaction, interaction.channel, interaction.user);
}

var helpExample = [
  "`>start`"
];

var helpText = [
  "Attempts to start a new board in the current channel"
];

module.exports = {
  messageCommand: startMessage,
  interactionCommand: startInteraction,
  help: helpText,
  example: helpExample
};
