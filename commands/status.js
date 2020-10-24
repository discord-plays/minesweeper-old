const Discord = require("discord.js");

function statusCommand(bot, msg, args = []) {
  let active = bot.getRunningGames();
  let guilds = bot.client.guilds.cache.size;
  let lines = [
    `I am in ${guilds} server${guilds==1?"":"s"}, playing ${active} game${active==1?"":"s"}.`
  ];
  msg.channel.send(new Discord.MessageEmbed()
    .setColor("#007766")
    .setAuthor("Discord Plays Minesweeper", bot.jsonfile.logoGame)
    .setDescription(lines.join('\n'))).catch(reason => {
    console.error(reason);
  });
}

var helpExample = [
  "`>status`"
];

var helpText = [
  "Get bot status"
];

module.exports = {
  command: statusCommand,
  help: helpText,
  example: helpExample
};