const fs = require("fs");
const Discord = require("discord.js");

function creditsCommand(bot, msg, args = []) {
  if (fs.existsSync(bot.creditsPath)) {
    fs.readFile(bot.creditsPath, (err, data) => {
      if (err) throw new Error("Error: Unable to find credits");
      var embed = new Discord.MessageEmbed()
        .setColor("#15d0ed")
        .setAuthor("Minesweeper!", bot.jsonfile.logoQuestion)
        .setTitle("Credits")
        .setDescription(data.toString());
      msg.channel.send(embed);
    });
  }
}

var helpExample = [
  "`>credits`"
];

var helpText = [
  "Thanks to all these people for working on the bot"
];

module.exports = {
  command: creditsCommand,
  help: helpText,
  example: helpExample
};