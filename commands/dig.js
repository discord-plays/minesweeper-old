function digCommand(msg, args, _a = true) {
  if (args.length < 1) {
    return msg.channel.send("Invalid options. Use >help for help.");
  }
  if (args.length > 1) {
    for (var i = 0; i < args.length; i++) {
      if (args[i] === null) continue;
      var o = digCommand(msg, [args[i]], i == args.length - 1);
      for (var j = [...[i]][0]; j < args.length; j++) {
        var cell = cellA1ToIndex(args[j]);
        if (o.filter(x => cell.col == o[0] && cell.row == o[1]).length >= 1)
          args[j] = null;
      }
    }
    return;
  }
  [coord] = args;
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

  if (coord == "remaining" || coord == "rest") {
    for (var i = 0; i < xMax; i++) {
      for (var j = 0; j < yMax; j++) {
        var cell = boardArray[guildId][channelId][i][j];
        if (cell[0] == 0 && cell[1] == 0) {
          boardArray[guildId][channelId][i][j][0] = 1;
          if (cell[2] != 0) {
            return bombExplode(guildId, channelId);
          }
        }
      }
    }
    detectWin(guildId, channelId);
    displayBoard(guildId, channelId);
    return;
  }

  var newCoord;
  try {
    newCoord = cellA1ToIndex(coord);
  } catch (err) {
    throw err;
  }

  var filledCells = [];
  if (newCoord.row > xMax || newCoord.col > yMax) {
    throw new Error("Error: Outside board range");
  } else if (
    boardArray[guildId][channelId][newCoord.row][newCoord.col][1] != 0
  ) {
    throw new Error("Error: Attempted to dig flagged square");
  } else if (
    boardArray[guildId][channelId][newCoord.row][newCoord.col][0] == 1
  ) {
    //throw new Error("Error: Square already uncovered");
    //Just skip this error for now it annoys everyone
  } else {
    filledCells = floodFill(guildId, channelId, newCoord.row, newCoord.col);
  }

  detectWin(guildId, channelId);

  if (_a) displayBoard(guildId, channelId);

  return filledCells;
}

function detectWin(guildId, channelId) {
  var xMax = boardArray[guildId][channelId][255][0];
  var yMax = boardArray[guildId][channelId][255][1];
  // detecting if you won code
  var totalSquares = (xMax - 1) * (yMax - 1);
  var totalNonMines = 0;
  var totalUncovered = 0;
  for (var i = 0; i < xMax; i++) {
    for (var j = 0; j < yMax; j++) {
      if (boardArray[guildId][channelId][i][j][2] == 0) {
        totalNonMines++;
      }
      if (boardArray[guildId][channelId][i][j][0] == 1) {
        totalUncovered++;
      }
    }
  }
  if (totalNonMines == totalUncovered) {
    return gameWin(guildId, channelId);
  }
}

module.exports = {
  command: digCommand
}