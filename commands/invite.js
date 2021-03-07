const Discord = require("discord.js");

function inviteCommand(bot, msg, args = []) {
  var embed = new Discord.MessageEmbed()
    .setColor("#15d0ed")
    .setAuthor("Minesweeper!", bot.jsonfile.logoQuestion)
    .setTitle("Invite Link")
    .setDescription(`[Invite @${bot.client.user.tag}](https://discordapp.com/oauth2/authorize?client_id=${bot.DISCORD_ID}&scope=bot)`);
  msg.channel.send(embed);
}

var helpExample = [
  "`>invite`"
];

var helpText = [
  "Shows the invite link"
];

module.exports = {
  command: inviteCommand,
  help: helpText,
  example: helpExample
};
