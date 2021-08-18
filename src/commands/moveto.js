const Discord = require('discord.js');
const Board = require('../game/Board');

function moveToCommand(bot, guildId, channelId, user, commandType, commandArg=null, replyFunc) {
  let boardId = `${guildId}-${guildId == "dm" ? user.id : channelId}`;
  if (bot.isBoard(boardId)) {
    if(commandType == "dm") {
      let board = bot.getBoard(boardId);
      let d = changeBoardDataChannel(board, "dm", null, user.id);
      if(bot.isBoard(d.id)) {
        throw new Error(`Error: Can't move this game to your DMs as there is currently a game running there.`);
      }

      // Create new board from raw data, then save and run post load
      let b = new Board(bot, d.id);
      bot.__boards[d.id] = b;
      b.loadRawData(d);
      b.save();
      b.postLoad(true);

      // Delete old board and show moving message
      board.delete();
      var embed = new Discord.MessageEmbed()
        .setColor("#de3597")
        .setAuthor(`Minesweeper!`, bot.jsonfile.logoQuestion)
        .setTitle("Moving to DMs")
        .setDescription("This game is being shipped into your DMs, you'll be notified when its ready.");
      replyFunc.reply({embeds:[embed],ephemeral:true});
    } else if(commandType == "channel") {
      let board = bot.getBoard(boardId);
      let d = changeBoardDataChannel(board, commandArg.guild.id, commandArg.id, user.id);
      if(bot.isBoard(d.id)) {
        throw new Error(`Error: Can't move this game to the channel: ${commandArg} as there is currently a game running there.`);
      }

      // Create new board from raw data, then save and run post load
      let b = new Board(bot, d.id);
      bot.__boards[d.id] = b;
      b.loadRawData(d);
      b.save();
      b.postLoad(true);

      // Delete old board and show moving message
      board.delete();
      var embed = new Discord.MessageEmbed()
        .setColor("#de3597")
        .setAuthor(`Minesweeper!`, bot.jsonfile.logoQuestion)
        .setTitle(`Moving to #${commandArg.name}`)
        .setDescription(`This game is being shipped to ${commandArg}, you'll be notified when its ready.`);
      replyFunc.reply({embeds:[embed],ephemeral:true});
    } else if(commandType == "newthread") {
      let board = bot.getBoard(boardId);
      board.getChannel().then(c=>{
        var startingEmbed = new Discord.MessageEmbed()
          .setColor("#de3597")
          .setAuthor(`Minesweeper!`, bot.jsonfile.logoQuestion)
          .setTitle("Auto-generated Thread")
          .setDescription("This thread was generated to move a Minesweeper game to. The game will be available shortly.");
        
        if(c.isThread())
          cn = c.parent;
        else
          cn = c;
        cn.threads.create({
          name: `dpm-game-from-${c.name}`,
          autoArchiveDuration: 60,
          reason: 'User requested game to be moved to a separate thread'
        }).then(async channel=>{
          await channel.send({embeds:[startingEmbed]});
          let d = changeBoardDataChannel(board, channel.guild.id, channel.id, user.id);
          if(bot.isBoard(d.id)) {
            throw new Error(`Error: There is somehow a game running in the thread ${channel} already even though it was just created.`);
          }

          // Create new board from raw data, then save and run post load
          let b = new Board(bot, d.id);
          bot.__boards[d.id] = b;
          b.loadRawData(d);
          b.save();
          b.postLoad(true,[user]);

          // Delete old board and show moving message
          board.delete();
          var embed = new Discord.MessageEmbed()
            .setColor("#de3597")
            .setAuthor(`Minesweeper!`, bot.jsonfile.logoQuestion)
            .setTitle(`Moving to #${channel.name}`)
            .setDescription(`This game is being shipped to ${channel}, you'll be notified when its ready.`);
          replyFunc.reply({embeds:[embed],ephemeral:true});
        });
      });
    }
  } else {
    return bot.sendMissingGame(replyFunc, guildId);
  }
}

function changeBoardDataChannel(board, guildId, channelId, userId) {
  let d = board.getRawData();
  d.id = `${guildId}-${guildId == "dm" ? userId : channelId}`;
  d.guildId = guildId;
  d.channelId = channelId;
  d.userId = userId;
  return d;
}

function moveToMessage(bot, msg, args = []) {
  if (args.length < 1 || args.length > 2) return bot.sendInvalidOptions("moveto", msg);
  [guildId, channelId] = [msg.guild == null ? "dm" : msg.guild.id, msg.channel.id];
  if ((args.length == 1 && args[0] == "dm")) {
    moveToCommand(bot, guildId, channelId, msg.author, "dm", null, {reply:a=>{
      if(typeof(a)==="string") a = {content:a};
      if(!a.hasOwnProperty("allowedMentions")) a.allowedMentions = {};
      a.allowedMentions.repliedUser = false;
      return msg.reply(a);
    }});
  } else if (args.length == 2 && args[0] == "channel") {
    getChannelFromMention(args[1]).then(channel=>{
      moveToCommand(bot, guildId, channelId, msg.author, "channel", channel, {reply:a=>{
        if(typeof(a)==="string") a = {content:a};
        if(!a.hasOwnProperty("allowedMentions")) a.allowedMentions = {};
        a.allowedMentions.repliedUser = false;
        return msg.reply(a);
      }});
    }).catch(reason=>{
      throw new Error('Error: An invalid channel was used in /moveto');
    });
  } else if (args.length == 1 && args[0] == "newthread") {
    moveToCommand(bot, guildId, channelId, msg.author, "newthread", null, {reply:a=>{
      if(typeof(a)==="string") a = {content:a};
      if(!a.hasOwnProperty("allowedMentions")) a.allowedMentions = {};
      a.allowedMentions.repliedUser = false;
      return msg.reply(a);
    }});
  }
}

function moveToInteraction(bot, interaction) {
  [guildId, channelId] = [interaction.guild == null ? "dm" : interaction.guild.id, interaction.channel.id];
  let a = interaction.options.getSubcommand();
  if (a == "dm") {
    moveToCommand(bot, guildId, channelId, interaction.user, "dm", null, interaction);
  } else if (a == "channel") {
    moveToCommand(bot, guildId, channelId, interaction.user, "channel", interaction.options.getChannel("target"), interaction);
  } else if (a == "newthread") {
    moveToCommand(bot, guildId, channelId, interaction.user, "newthread", null, interaction);
  }
  else return bot.sendInvalidOptions("moveto", interaction);
}

function getChannelFromMention(client, content) {
  const matches = content.match(/^<#!?(\d+)>$/);
  if (!matches) return;
  const id = matches[1];
  return client.channels.fetch(id);
}


var helpExample = [
  "`>moveto dm`",
  "`>moveto channel #channelname`"
];
var helpText = [
  "Move the current game to DMs or a different channel"
];
var moveToOptions = [{
  name: 'dm',
  type: 'SUB_COMMAND',
  description: 'Send the current game to your DMs',
  options: []
},
{
  name: 'channel',
  type: 'SUB_COMMAND',
  description: 'Send the current game to a specific channel',
  options: [{
    name: 'target',
    type: 'CHANNEL',
    description: 'The channel to send the current game to',
    required: true
  }]
},
{
  name: 'newthread',
  type: 'SUB_COMMAND',
  description: 'Send the current game to a new thread',
  options: []
}];

module.exports = {
  messageCommand: moveToMessage,
  interactionCommand: moveToInteraction,
  help: helpText,
  example: helpExample,
  options: moveToOptions
};
