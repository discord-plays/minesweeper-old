const Discord = require("discord.js");
const address = require('../address');

function startCommand(bot, replyFunc, outChannel, author, args) {
  bot.web.updateUserLastChannel(author, outChannel);
  if(args.length == 1) {
    let mission = bot.findMission(args[0]);
    if(mission === null) {
      throw new Error(`Error: Mission \`${args[0]}\` doesn't exist`);
    } else {
      mission.command(d=>{
        bot.startGame(outChannel, d, replyFunc);
      });
    }
  } else if(args.length == 3) {
    let width = parseInt(args[0]);
    let height = parseInt(args[1]);
    let numMines = parseInt(args[2]);
    if(isNaN(width)) throw new Error(`Error: Width value must be a positive integer`);
    if(isNaN(height)) throw new Error(`Error: Height value must be a positive integer`);
    if(isNaN(numMines)) throw new Error(`Error: Number of mines must be a positive integer`);

    startSimpleGame(numMines,width,height,d=>{
      bot.startGame(outChannel, d, replyFunc);
    });
  } else {
    var embed = new Discord.MessageEmbed()
      .setColor("#15d0ed")
      .setAuthor("Minesweeper!", bot.jsonfile.logoQuestion)
      .setTitle("Start game")
      .setDescription([
        'If you already have the board creation page open in your browser you can just refresh it instead of opening the page again',
        'Disclaimer: You are required to login using your Discord account. If you are already logged in you can just press authorize to allow Discord Plays Minesweeper to know who you are.'
      ].join('\n'));
    var row = new Discord.MessageActionRow().addComponents(
      new Discord.MessageButton()
        .setLabel("Create a Board")
        .setStyle("LINK")
        .setURL(address.create.toString())
    );
    replyFunc.reply({
      embeds:[embed],
      components:[row],
      ephemeral:true
    });
  }
}

function startMessage(bot, msg, args = []) {
  if (args.length > 1) return bot.sendInvalidOptions("start", msg);
  startCommand(bot, {reply:a=>{
    if(typeof(a)==="string") a = {content:a};
    if(!a.hasOwnProperty("allowedMentions")) a.allowedMentions = {};
    a.allowedMentions.repliedUser = false;
    return msg.reply(a);
  }}, msg.channel, msg.author, args);
}

function startInteraction(bot, interaction) {
  let opt=(interaction.options.getString("options") || "").split(' ').filter(x=>x!=="");
  startCommand(bot, interaction, interaction.channel, interaction.user, opt);
}

function startSimpleGame(n,w,h,startBoard) {
  var data = {
    mines: {
      'discordplaysminesweeper.base.number-1': n
    },
    board: {
      width: w,
      height: h
    }
  };
  startBoard(data);
}

var helpExample = [
  "`>start`",
  "`>start <preset name>`",
  "`>start <width> <height> <number of mines>`"
];
var helpText = [
  "Attempts to start a new board in the current channel",
  "Do `>presets` to see the available presets"
];
var startOptions = [{
  name: 'options',
  type: 'STRING',
  description: 'Options to start Minesweeper (leave this empty for a link to the advanced options)'
}];

module.exports = {
  messageCommand: startMessage,
  interactionCommand: startInteraction,
  help: helpText,
  example: helpExample,
  options: startOptions
};
