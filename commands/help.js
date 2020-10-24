const Discord = require("discord.js");

function helpCommand(bot, msg, args = []) {
  var settings = bot.getPerServerSettings(msg.guild.id);

  // if there are no args then null will be the 0th item in the array
  var command = [...args, null][0];
  var embed = null;
  var arr = null;
  var exArr = [];
  if (command != null) {
    var commandScript = bot.findCommand(command);
    if (commandScript == null) throw new Error(`Error: command \`${command}\` doesn't exist`);
    else if (commandScript.hasOwnProperty("help")) {
      var onlyDebug = false;
      if (commandScript.hasOwnProperty("debugOnly") && commandScript.debugOnly) onlyDebug = true;
      if (!onlyDebug || bot.DEBUG) {
        arr = commandScript.help;
        if (commandScript.hasOwnProperty("example")) {
          exArr = commandScript.example.map(x => x.replace(/^`>/, `\`${settings.prefix}`));
        }
      }
    }
  }
  embed = new Discord.MessageEmbed()
    .setColor("#15d0ed")
    .setAuthor("Minesweeper!", bot.jsonfile.logoQuestion)
    .setTitle(arr == null ? "General help" : "Help: " + command)
    .setDescription(arr == null ? generateGeneralHelpText(bot, msg).join("\n") : arr.join('\n'));
  if (exArr.length != 0) embed.addField(`Example${exArr.length==1?"":"s"}`, exArr.join('\n'));
  msg.channel.send(embed);
}

function generateGeneralHelpText(bot, msg) {
  var settings = bot.getPerServerSettings(msg.guild == null ? "dm" : msg.guild.id);
  var commandNames = bot.__commandslist.commands.map(x => bot.__commandslist.getCommandName(x));
  var commandDetails = [];
  for (var i = 0; i < commandNames.length; i++) {
    var comm = bot.findCommand(commandNames[i]);
    if (!comm.hasOwnProperty("help")) continue;
    var onlyDebug = false;
    if (comm.hasOwnProperty("debugOnly"))
      if (comm.debugOnly) onlyDebug = true;
    if (!bot.DEBUG && onlyDebug) continue;
    commandDetails.push(`\`${settings.prefix}help ${commandNames[i]}\` -${onlyDebug?" (DEBUG)":""} ${bot.findCommand(commandNames[i]).help}`);
  }
  return commandDetails;
}

var helpExample = [
  "`>help`",
  "`>help <command>`"
];
var helpText = [
  "Maybe this command opens the help text?"
];

module.exports = {
  command: helpCommand,
  help: helpText,
  example: helpExample
}