const Discord = require("discord.js");

// This is basically just the kill command without checking for an error
// It will stay like this until a points system is adopted

function forfeitCommand(bot, guildId, channelId, userId, replyFunc) {
  let boardId = `${guildId}-${guildId == "dm" ? userId : channelId}`;
  if (bot.isBoard(boardId)) {
    bot.getBoard(boardId).delete();
    replyFunc.reply({embeds:[
      new Discord.MessageEmbed()
        .setColor("#292340")
        .setAuthor("Discord Plays Minesweeper", bot.jsonfile.logoQuestion)
        .setTitle(`The current game was forfeited`)
    ]});
  } else {
    return bot.sendMissingGame(replyFunc, guildId);
  }
}

function forfeitMessage(bot, msg, args = []) {
  if (args.length > 0) return bot.sendInvalidOptions("forfeit", msg);
  [guildId, channelId] = [msg.guild == null ? "dm" : msg.guild.id, msg.channel.id];
  forfeitCommand(bot, guildId, channelId, msg.author.id, {reply:a=>{
    if(typeof(a)==="string") a = {content:a};
    if(!a.hasOwnProperty("allowedMentions")) a.allowedMentions = {};
    a.allowedMentions.repliedUser = false;
    return msg.reply(a);
  }});
}

function forfeitInteraction(bot, interaction) {
  [guildId, channelId] = [interaction.guild == null ? "dm" : interaction.guild.id, interaction.channel.id];
  forfeitCommand(bot, guildId, channelId, interaction.user.id, interaction);
}

var helpExample = [
  "`>forfeit`"
];
var helpText = [
  "Forfeit the currently running game"
];

module.exports = {
  messageCommand: forfeitMessage,
  interactionCommand: forfeitInteraction,
  help: helpText,
  example: helpExample
};
