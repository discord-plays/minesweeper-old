const Discord = require('discord.js');
const address = require('../address');

function missionsCommand(bot, replyFunc) {
  let r = {reply:a=>{
    if(typeof(a)==="string") a = {content:a};
    if(!a.hasOwnProperty("allowedMentions")) a.allowedMentions = {};
    a.allowedMentions.repliedUser = false;
    return msg.reply(a);
  }};

  var embed = new Discord.MessageEmbed()
    .setColor("#15d0ed")
    .setAuthor("Minesweeper!", bot.jsonfile.logoQuestion)
    .setTitle("Missions")
    .setDescription([
      'Some useful ones for you:',
      '- easy'
    ].join('\n'));
    var row = new Discord.MessageActionRow().addComponents(
      new Discord.MessageButton()
        .setLabel("Full missions list")
        .setStyle("LINK")
        .setURL(address.missions.toString())
    );
    replyFunc.reply({embeds:[embed],components:[row],ephemeral:true});
}

function missionsMessage(bot, msg, args = []) {
  if (args.length > 0) return bot.sendInvalidOptions("missions", msg);
  missionsCommand(bot, {reply:a=>{
    if(typeof(a)==="string") a = {content:a};
    if(!a.hasOwnProperty("allowedMentions")) a.allowedMentions = {};
    a.allowedMentions.repliedUser = false;
    return msg.reply(a);
  }});
}

function missionsInteraction(bot, interaction) {
  missionsCommand(bot, interaction);
}

var helpExample = [
  "`>missions`"
];

var helpText = [
  "List all missions"
];

module.exports = {
  messageCommand: missionsMessage,
  interactionCommand: missionsInteraction,
  help: helpText,
  example: helpExample
};
