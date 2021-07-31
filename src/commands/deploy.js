const Discord = require("discord.js");

function deployCommand(bot, msg, args = []) {
  if(msg.author.id == bot.jsonfile.ownerId) {
    if(args.length==1) {
      if(args[0]=="global") {
        registerCommands(bot, collected=>{
          client.application.commands.set(collected);
          msg.channel.send({embeds:[new Discord.MessageEmbed().setDescription("<:tickIcon:646028905870000171>")]});
        });
      } else if(args[0]=="guild") {
        if(msg.channel.guild == null) {
          msg.channel.send({embeds:[new Discord.MessageEmbed().setDescription("This command can only be used inside the guild you wish to deploy updated slash commands in")]});
        } else {
          registerCommands(bot, collected=>{
            msg.channel.guild.commands.set(collected);
            msg.channel.send({embeds:[new Discord.MessageEmbed().setDescription("<:tickIcon:646028905870000171>")]});
          });
        }
      } else {
        let settings = bot.getPerServerSettings(msg.guild == null ? "dm" : msg.guild.id);
        msg.channel.send({embeds:[new Discord.MessageEmbed().setDescription(`Valid commands are \`${settings.prefix}deploy global\` or \`${settings.prefix}deploy guild\``)]});
      }
    } else {
      let settings = bot.getPerServerSettings(msg.guild == null ? "dm" : msg.guild.id);
      msg.channel.send({embeds:[new Discord.MessageEmbed().setDescription(`Valid commands are \`${settings.prefix}deploy global\` or \`${settings.prefix}deploy guild\``)]});
    }
  }
}

function registerCommands(bot, callback) {
  bot.getAllCommands().then(commands=>{
    let collected = commands.map(x=>{
      let c = bot.findCommand(x);
      return {
        name: x,
        description: c.help.join(' ')
      }
    });
    callback(collected);
  });
}

var helpExample = [
  "`>deploy`"
];

var helpText = [
  "Deploy updated slash commands"
];

module.exports = {
  messageCommand: deployCommand,
  help: helpText,
  isHidden: true,
  example: helpExample
};
