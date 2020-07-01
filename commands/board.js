function boardCommand(bot, msg, args = []) {
  if (args.length > 0) {
    return msg.channel.send("Invalid options. Use >help for help.");
  }
  [guildId, channelId] = [msg.guild.id, msg.channel.id];
  if (!Object.keys(boardArray).includes(guildId)) {
    return msg.channel.send(
      "No game running here. Learn how to start one in >help"
    );
  }
  if (!Object.keys(boardArray[guildId]).includes(channelId)) {
    return msg.channel.send(
      "No game running here. Learn how to start one in >help"
    );
  }

  displayBoard(guildId, channelId);
}