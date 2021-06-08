const Discord = require("discord.js");

function statusCommand(bot, msg, args = []) {
  let active = bot.getRunningGames();
  let guildCache = bot.client.guilds.cache;
  let guilds = guildCache.size;
  let lines = [
    `I am in ${guilds} server${guilds==1?"":"s"}, playing ${active} game${active==1?"":"s"}.`
  ];
  msg.channel.send(new Discord.MessageEmbed()
    .setColor("#007766")
    .setAuthor("Discord Plays Minesweeper", bot.jsonfile.logoGame)
    .setDescription(lines.join('\n'))).catch(reason => {
    console.error(reason);
  });
  if(bot.DEBUG) console.log("Guild names:\n"+guildCache.map(x=>` - ${x.name}`).join('\n'));
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