function startCommand(that, msg, args) {
  if (o.length < 2) return msg.channel.send("The options must include the size");

  // parse first two arguments as xSize and ySize
  [xSize, ySize] = o.splice(0, 2).map(x=>parseInt(x.trim()));
  if(isNaN(xSize)||isNaN(ySize))return msg.channel.send("The width and height must be numbers");

  // get the guild and channel ids
  [guildId, channelId] = [msg.guild.id, msg.channel.id];
  
  if (Object.keys(that.boardArray).includes(bombid)) {
    return msg.channel.send(
      "There is already a game running here. Try in another channel."
    );
  }

  if (xSize <= 0 || ySize <= 0) {
    throw new Error("Error: Board too small!");
  }
  if (xSize > maxBoardX || ySize > maxBoardY) {
    throw new Error("Error: Board too big!");
  }

  var sCount = 0,
    dCount = 0,
    tCount = 0,
    aCount = 0,
    randMine = 0;
  var totalMines = sMines + dMines + tMines + aMines;

  if (xSize * ySize <= totalMines) {
    throw new Error("Error: Too many mines for the board!");
  }

  if (totalMines < 1) {
    throw new Error("Error: Not enough mines on the board!");
  }

  that.boardArray[bombId] = new MinesweeperBoard(xSize, ySize, sMines, dMines, tMines, aMines);

  var xRand = 0,
    yRand = 0;
  var regenMine = true;


  // Yo melon code from here

  for (i = 0; i < xSize; i++) {
    boardArray[guildId][channelId][i] = [];
    for (j = 0; j < ySize; j++) {
      boardArray[guildId][channelId][i][j] = [0, 0, 0, 255];
    }
  }

  var previousMineCoords = [];
  for (var i = 0; i < totalMines; i++) {
    xRand = Math.floor(Math.random() * xSize);
    yRand = Math.floor(Math.random() * ySize);
    while (
      previousMineCoords.filter(x => x[0] == xRand && x[1] == yRand).length >= 1
    ) {
      xRand = Math.floor(Math.random() * xSize);
      yRand = Math.floor(Math.random() * ySize);
    }
    regenMine = true;
    while (regenMine == true) {
      randMine = randomMine();
      if (randMine == 1) {
        if (sCount == sMines) {
          regenMine = true;
        } else {
          sCount++;
          regenMine = false;
        }
      } else if (randMine == 2) {
        if (dCount == dMines) {
          regenMine = true;
        } else {
          dCount++;
          regenMine = false;
        }
      } else if (randMine == 3) {
        if (tCount == tMines) {
          regenMine = true;
        } else {
          tCount++;
          regenMine = false;
        }
      } else if (randMine == 4) {
        if (aCount == aMines) {
          regenMine = true;
        } else {
          aCount++;
          regenMine = false;
          randMine = -1;
        }
      } else {
        throw new Error("Error: Invalid Value for randMine");
      }
    }
    boardArray[guildId][channelId][xRand][yRand][2] = randMine;
    previousMineCoords.push([xRand, yRand]);
  }

  fillNumbers(guildId, channelId);

  displayBoard(guildId, channelId, (exploded = false), (won = false));
}