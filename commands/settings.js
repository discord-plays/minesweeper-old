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
      let menu = bot.menuController.createMenu(msg.author);
      menu.name = "User Settings";
      menu.color = 0x0099ff;
      menu.description = "This is a test description xD";

      let input = menu.addArrayInputWidget();
      input.name = 'Array Input';
      input.addOption('Melon','🍉');
      input.addOption('Crocodile','🐊');
      input.addOption('Cat','😺');
      input.setCallback(symbol=>console.log(`Picked (input): ${symbol}`));

      let input1 = menu.addArrayInputWidget();
      input1.name = 'Array Input 1';
      input1.addOption('Dog','🐶');
      input1.addOption('Hotdog','🌭');
      input1.addOption('Truck','🚛');
      input1.setCallback(symbol=>console.log(`Picked (input1): ${symbol}`));

      let input2 = menu.addArrayInputWidget();
      input2.name = 'Some other array input';
      input2.addOption('Diamond','💎');
      input2.addOption('Lipstick','💄');
      input2.addOption('Snowman','⛄');
      input2.setCallback(symbol=>console.log(`Picked (input2): ${symbol}`));

      let input3 = menu.addStringInputWidget();
      input3.name = 'Test string input thingy';
      input3.setCallback(text=>console.log(`Text (input3): ${text}`));

      menu.sendTo(dm);
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
