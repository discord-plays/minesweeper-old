function appleCommand(bot, msg, args = []) {
  if (args.length > 0) return bot.sendInvalidOptions("apple", msg);
  ({reply:a=>{
    if(typeof(a)==="string") a = {content:a};
    if(!a.hasOwnProperty("allowedMentions")) a.allowedMentions = {};
    a.allowedMentions.repliedUser = false;
    return msg.reply(a);
  }}).reply(":apple:");
}

var helpExample = [
  "`>apple`"
];

var helpText = [
  "Summon apple emoji"
];

module.exports = {
  messageCommand: appleCommand,
  help: helpText,
  isHidden: true,
  example: helpExample
};
