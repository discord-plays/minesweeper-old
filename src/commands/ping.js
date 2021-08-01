const Discord = require("discord.js");

function pingCommand(bot, replyFunc) {
  replyFunc.reply({embeds:[
    new Discord.MessageEmbed()
      .setColor("#d9a6a7")
      .setAuthor("Discord Plays Minesweeper", bot.jsonfile.logoQuestion)
      .setTitle(`Pong (${Math.floor(bot.client.ws.ping)}ms heartbeat)`)
  ]});
}

function pingMessage(bot, msg, args = []) {
  if (args.length > 0) return bot.sendInvalidOptions("play", msg);
  pingCommand(bot, msg);
}

function pingInteraction(bot, interaction) {
  pingCommand(bot, interaction);
}

var helpExample = [
  "`>ping`"
];

var helpText = [
  "Pings me"
];

module.exports = {
  messageCommand: pingMessage,
  interactionCommand: pingInteraction,
  help: helpText,
  example: helpExample
};