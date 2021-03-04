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
      let menu = bot.menuController.createMenu();
      menu.title = "User Settings";
      menu.color = 0x0099ff;
      menu.description = "This is a test description xD";

      let input = menu.addArrayInputWidget();
      input.name = 'Array Input';

      let input1 = menu.addArrayInputWidget();
      input1.name = 'Array Input 1';

      let input2 = menu.addArrayInputWidget();
      input2.name = 'Some other array input';

      menu.sendTo(dm).then(async m=>{
        let o=menu.getWidgetOptionSymbols();
        for(let i=0;i<o.length;i++) await m.react(o[i]);
      });
    })
  } else {
    // Server settings menu
    let author = msg.author;
    author.createDM().then(dm=>{
      // TODO: Finish UI
      // UI classes aren't committed
      dm.send('Opening DMs for server settings menu');
    });
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
