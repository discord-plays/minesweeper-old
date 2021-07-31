const Discord = require("discord.js");

function statsCommand(bot, outChannel) {
  outChannel.send({embeds:[
    new Discord.MessageEmbed()
    .setDescription("this is a WIP") //TODO: literally everything to do with saving leaderboards and stats 
  ]});
}

function statsMessage(bot, msg, args = []) {
  if (args.length > 0) return bot.sendInvalidOptions("play", msg);
  statsCommand(bot, msg.channel);
}

function statsInteraction(bot, interaction) {
  statsCommand(bot, interaction.channel);
}

/**
 * ANCHOR: FOR LATER:
 * This function will display things like total games played, total games won, % win rate, etc. 
 * it will have separate leaderboards for global stats, and server stats, as well as stats on each player
 * full list of stats to be included below: (I may have missed one or 2)
 * 
 * Total Games Played
 * Total Games Won/Lost (W/L Ratio and/or %win)
 * Total Commands
 * Server Ranking
 * Global Ranking
 * Score* (only if we make it such that each game, upon completion gives a certain score based on contribution)
 */


var helpExample = [
  "`>stats global`",
  "`>stats guild`"
];

var helpText = [
  "Gets bot statistics about played games"
];

module.exports = {
  messageCommand: statsMessage,
  interactionCommand: statsInteraction,
  help: helpText,
  example: helpExample
};