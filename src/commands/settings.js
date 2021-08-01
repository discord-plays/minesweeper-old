const { Permissions, MessageEmbed } = require('discord.js');

function settingsCommand(bot, replyFunc, outGuild, author, member) {
  replyFunc.reply({embeds:[new MessageEmbed()
    .setColor("#cc8800")
    .setTitle("Sending you more details in your DMs")
  ]});
  if(outGuild===null) {
    // User settings menu
    author.createDM().then(dm=>{
      // Test UI as user menu isn't ready yet
      let menu = bot.menuController.createMenu(author);
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
    let guildId = outGuild.id;
    if(member.permissions.has(Permissions.FLAGS.MANAGE_GUILD, true)) {
      author.createDM().then(dm=>{
        let menu = bot.menuController.createMenu(author);
        menu.name = `Server Settings (${outGuild.name})`;
        menu.color = 0xff9900;
        menu.description = "Edit the settings for a server";

        let s=bot.getPerServerSettings(guildId);

        let prefixInput = menu.addStringInputWidget();
        prefixInput.name = 'Prefix string (to replace `>` before commands)';
        prefixInput.value = s.prefix;
        prefixInput.setCallback(text=>changeSettings(bot,member,dm,guildId,"prefix",text));

        menu.sendTo(dm);
      });
    } else {
      author.createDM().then(dm=>{
        dm.channel.send({embeds:[
          new Discord.MessageEmbed()
          .setColor("#ff0000")
          .setAuthor("Uh Oh...")
          .setTitle('You don\'t have permission to edit these server settings')
        ]});
      })
    }
  }
}

function changeSettings(bot, member, dm, guildId, f, v) {
  if(member.permissions.has(Permissions.FLAGS.MANAGE_GUILD, true)) {
    let s=bot.getPerServerSettings(guildId);
    s[f]=v.replace(/[`\\@#:]/g,'_');
    bot.setPerServerSettings(guildId,s);
  } else {
    dm.send({embeds:[
      new Discord.MessageEmbed()
      .setColor("#ff0000")
      .setAuthor("Uh Oh...")
      .setTitle('You don\'t have permission to edit these server settings')
    ]});
  }
}

function settingsMessage(bot, msg, args = []) {
  if (args.length > 0) return bot.sendInvalidOptions("settings", msg);
  settingsCommand(bot, {reply:a=>{
    if(typeof(a)==="string") a = {content:a};
    if(!a.hasOwnProperty("allowedMentions")) a.allowedMentions = {};
    a.allowedMentions.repliedUser = false;
    return msg.reply(a);
  }}, msg.guild, msg.author, msg.member);
}

function settingsInteraction(bot, interaction) {
  settingsCommand(bot, interaction, interaction.guild, interaction.user, interaction.member);
}

var helpExample = [
  "`>settings`"
];
var helpText = [
  "Opens the user or server settings menu"
];

module.exports = {
  messageCommand: settingsMessage,
  interactionCommand: settingsInteraction,
  help: helpText,
  example: helpExample
};
