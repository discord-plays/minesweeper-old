function deployCommand(bot, msg, args = []) {
  let r = {reply:a=>{
    if(typeof(a)==="string") a = {content:a};
    if(!a.hasOwnProperty("allowedMentions")) a.allowedMentions = {};
    a.allowedMentions.repliedUser = false;
    return msg.reply(a);
  }};
  if(msg.author.id == bot.jsonfile.ownerId) {
    if(args.length==1) {
      if(args[0]=="global") {
        registerCommands(bot, collected=>{
          bot.client.application.commands.set(collected);
          r.reply("<:boxYes:871365040509419550>");
        });
      } else if(args[0]=="guild") {
        if(msg.channel.guild == null) {
          r.reply("This command can only be used inside the guild you wish to deploy updated slash commands in");
        } else {
          registerCommands(bot, collected=>{
            msg.channel.guild.commands.set(collected);
            r.reply("<:boxYes:871365040509419550>");
          });
        }
      } else {
        let settings = bot.getPerServerSettings(msg.guild == null ? "dm" : msg.guild.id);
        r.reply(`Valid commands are \`${settings.prefix}deploy global\` or \`${settings.prefix}deploy guild\``);
      }
    } else {
      let settings = bot.getPerServerSettings(msg.guild == null ? "dm" : msg.guild.id);
      r.reply(`Valid commands are \`${settings.prefix}deploy global\` or \`${settings.prefix}deploy guild\``);
    }
  }
}

function registerCommands(bot, callback) {
  let commands = bot.getAllCommands();
  let collected = commands.map(x=>{
    let c = bot.findCommand(x);
    return (c==null||c.isHidden||c.debugOnly) ? null : {
      name: x,
      description: c.help.join(' '),
      ...(c.hasOwnProperty("options") ? {options: c.options} : {})
    };
  }).filter(x=>x!=null);
  callback(collected);
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
