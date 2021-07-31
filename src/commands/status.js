const Discord = require("discord.js");

function statusCommand(bot, outChannel) {
  let active = bot.getRunningGames();
  let guildCache = bot.client.guilds.cache;
  let guilds = guildCache.size;
  let lines = [
    `I am in ${guilds} server${guilds==1?"":"s"}, playing ${active} game${active==1?"":"s"}.`
  ];
  outChannel.send({embeds:[
    new Discord.MessageEmbed()
    .setColor("#007766")
    .setAuthor("Discord Plays Minesweeper", bot.jsonfile.logoGame)
    .setDescription(lines.join('\n'))
  ]}).catch(reason => {
    console.error(reason);
  });
  if(bot.DEBUG) console.log("Guild names:\n"+guildCache.map(x=>` - ${x.name}`).join('\n'));
}

function statusMessage(bot, msg, args = []) {
  if (args.length > 0) return bot.sendInvalidOptions("status", msg);
  statusCommand(bot, msg.channel);
}

function statusInteraction(bot, interaction) {
  statusCommand(bot, interaction.channel);
}

var helpExample = [
  "`>status`"
];

var helpText = [
  "Get bot status"
];

module.exports = {
  messageCommand: statusMessage,
  interactionCommand: statusInteraction,
  help: helpText,
  example: helpExample
};