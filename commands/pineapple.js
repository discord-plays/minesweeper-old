const Discord = require("discord.js");

function pineappleCommand(bot, msg, args = []) {
  msg.channel.send(new Discord.RichEmbed()
    .setDescription(":pineapple:"));
}

module.exports = {
  command: pineappleCommand
}