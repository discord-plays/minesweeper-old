function settingsCommand(bot, msg, args = []) {
  if (args.length > 0) {
    return bot.sendInvalidOptions("settings", msg);
  }

  if(msg.guild===null) {
    // User settings menu
    let author = msg.author;
    author.createDM().then(dm=>{
      // TODO: Finish UI
      // UI classes aren't committed
      dm.send('Opening DMs for user settings menu')
    })
  } else {
    // Server settings menu
    let author = msg.author;
    author.createDM().then(dm=>{
      // TODO: Finish UI
      // UI classes aren't committed
      dm.send('Opening DMs for server settings menu')
    })
  }
}

var helpExample = [
  "`>settings`"
];
var helpText = [
  "Opens the user or server settings menu"
];

module.exports = {
  command: settingsCommand,
  help: helpText,
    example: helpExample
  };
