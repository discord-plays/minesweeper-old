function flagCommand(msg, args) {
  // coord is type string, such as 'A1' or 'G6' | flagType is type string, only 'S', 'D', 'T' or 'A' (case-insensitive)
  if (args.length < 1) {
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
  var xMax = boardArray[guildId][channelId][255][0];
  var yMax = boardArray[guildId][channelId][255][1];

  ap = parseFlagCommandArgs(args);
  for (var j = 0; j < ap.length; j++) {
    args = ap[j];
    flagType = args.pop();
    coords = args;

    for (var i = 0; i < coords.length; i++) {
      var coord = coords[i];
      var newCoord;
      var flagInt;
      try {
        newCoord = cellA1ToIndex(coord);
        flagInt = flagToInt(flagType);
      } catch (err) {
        throw err;
      }

      if (boardArray[guildId][channelId][255] == undefined) {
        throw new Error("Error: No board");
      } else if (newCoord.row > xMax || newCoord.col > yMax) {
        throw new Error("Error: Outside board range");
      } else if (
        boardArray[guildId][channelId][newCoord.row][newCoord.col][0] == 1
      ) {
        throw new Error("Error: Attempted to flag uncovered square");
      } else {
        if (
          boardArray[guildId][channelId][newCoord.row][newCoord.col][1] == 0
        ) {
          boardArray[guildId][channelId][newCoord.row][
            newCoord.col
          ][1] = flagInt;
        } else {
          boardArray[guildId][channelId][newCoord.row][newCoord.col][1] = 0;
        }
      }
    }
  }
  displayBoard(guildId, channelId, (exploded = false), (won = false));
}

function parseFlagCommandArgs(args) {
  var o = [];
  var section = [];
  var error = false;
  for (var i = 0; i < args.length; i++) {
    try {
      cellA1ToIndex(args[i]);
      section.push(args[i]);
      continue;
    } catch (err) {
      if (section.length == 0) {
        error = true;
        break;
      }
    }
    try {
      flagToInt(args[i]);
      section.push(args[i]);
      o.push([...section]);
      section = [];
      continue;
    } catch (err) {
      error = true;
      break;
    }
  }
  if (error) throw new Error("Error: Arguments invalid for flag command");
  if (section.length > 0) {
    section.push("s");
    o.push(section);
  }
  return o;
}

module.exports = {
  command: flagCommand
}