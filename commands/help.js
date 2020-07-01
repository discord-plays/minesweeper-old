const Discord = require("discord.js");

function helpCommand(bot, msg, args = []) {
  // if there are no args then null will be the 0th item in the array
  var command = [...args, null][0];
  var embed = null;
  switch (command) {
    case "help":
      embed = new Discord.RichEmbed()
        .setColor("#15d0ed")
        .setAuthor("Minesweeper!", bot.jsonfile.logoQuestion)
        .setTitle("Help: " + command)
        .setDescription(">help (command):\nShows help for a command.")
        .addField("Example:", "`>help dig`");
      break;
    case "dig":
      embed = new Discord.RichEmbed()
        .setColor("#15d0ed")
        .setAuthor("Minesweeper!", bot.jsonfile.logoQuestion)
        .setTitle("Help: " + command)
        .setDescription(">dig [A1] {B2} {C3}:\nDigs coordinates.")
        .addField("Example:", "`>dig A3 C5");
      break;
    case "flag":
      embed = new Discord.RichEmbed()
        .setColor("#15d0ed")
        .setAuthor("Minesweeper!", bot.jsonfile.logoQuestion)
        .setTitle("Help: " + command)
        .setDescription(">flag [A1] {B2} {S|D|T|A} {C3} {D4} {S|D|T|A} {E5}:\nFlags coordinates with flags. (Default type is Single)")
        .addField("Example:", "`>flag D4 B6 T R4 E9 D8 A B7 C3`");
      break;
    case "start":
      embed = new Discord.RichEmbed()
        .setColor("#15d0ed")
        .setAuthor("Minesweeper!", bot.jsonfile.logoQuestion)
        .setTitle("Help: " + command)
        .setDescription(">start [width] [height] [single mines] (double mines) (triple mines) (anti-mines):\nCreates a game with the specified parameters.")
        .addField("Example:", "`>start 8 8 10 5`");
      break;
    case "board":
      embed = new Discord.RichEmbed()
        .setColor("#15d0ed")
        .setAuthor("Minesweeper!", bot.jsonfile.logoQuestion)
        .setTitle("Help: " + command)
        .setDescription(">board:\nShows the current game's state.")
        .addField("Example:", "`>board`");
      break;
  }
  if (embed == null) {
    embed = new Discord.RichEmbed()
      .setColor("#15d0ed")
      .setAuthor("Minesweeper!", bot.jsonfile.logoQuestion)
      .setTitle("Help")
      .setDescription(
        `Github: ${bot.jsonfile.github}`
      )
      .addField(
        "Help",
        "`>help [command]` - Shows Help"
      )
      .addField(
        "Start",
        "`>start [width] [height] [single mines] {double mines} {triple mines} {anti-mines}` - Starts a game with those parameters"
      )
      .addField(
        "Dig",
        "`>dig [A1] {B2} {AA5}...` - Dig those positions in an ongoing game"
      )
      .addField(
        "Flag",
        "`>flag [A1] {B2} {type} {C3} {D4} {type} {E5}` - Flags multiple positions with different flag types (last ones will default to single)"
      )
      .addField(
        "Board",
        "`>board` - Displays the current state of the game"
      );
    break;
  }
  msg.channel.send(embed);
}

module.exports = {
  command: helpCommand
}