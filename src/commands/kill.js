const Discord = require("discord.js");

function killCommand(bot, guildId, channelId, replyFunc) {
  let boardId = guildId + "-" + channelId;
  if (bot.isBoard(boardId)) {
    if(bot.getBoard(boardId).hadError) {
      bot.getBoard(boardId).delete();
      replyFunc.reply({embeds:[
        new Discord.MessageEmbed()
          .setColor("#ba0c08")
          .setAuthor("Discord Plays Minesweeper", bot.jsonfile.logoQuestion)
          .setTitle(`The current game was killed`)
      ]});
    } else {
      let settings = bot.getPerServerSettings(guildId);
      throw new Error(`Error: A game can only be killed if it had an error. Try using the \`${settings.prefix}forfeit\` command if you just want to stop a game.`);
    }
  } else {
    return bot.sendMissingGame(replyFunc, guildId);
  }
}

function killMessage(bot, msg, args = []) {
  if (args.length > 0) return bot.sendInvalidOptions("kill", msg);
  [guildId, channelId] = [msg.guild == null ? "dm" : msg.guild.id, msg.channel.id];
  killCommand(bot, guildId, channelId, {reply:a=>{
    if(typeof(a)==="string") a = {content:a};
    if(!a.hasOwnProperty("allowedMentions")) a.allowedMentions = {};
    a.allowedMentions.repliedUser = false;
    return msg.reply(a);
  }});
}

function killInteraction(bot, interaction) {
  [guildId, channelId] = [interaction.guild == null ? "dm" : interaction.guild.id, interaction.channel.id];
  killCommand(bot, guildId, channelId, interaction);
}

var helpExample = [
  "`>kill`"
];
var helpText = [
  "Kill the currently running game if it has thrown an error"
];

module.exports = {
  messageCommand: killMessage,
  interactionCommand: killInteraction,
  help: helpText,
  example: helpExample
};
