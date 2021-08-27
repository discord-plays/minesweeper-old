function orangeCommand(bot, msg, args = []) {
  if (args.length > 0) return bot.sendInvalidOptions("orange", msg);
  ({reply:a=>{
    if(typeof(a)==="string") a = {content:a};
    if(!a.hasOwnProperty("allowedMentions")) a.allowedMentions = {};
    a.allowedMentions.repliedUser = false;
    return msg.reply(a);
  }}).reply(":tangerine:");
}

var helpExample = [
  "`>orange`"
];

var helpText = [
  "Summon orange emoji"
];

module.exports = {
  messageCommand: orangeCommand,
  help: helpText,
  isHidden: true,
  example: helpExample
};
