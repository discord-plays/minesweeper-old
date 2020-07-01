/*
 * Discord Plays Minesweeper Bot
 */

/* .env
 *
 * TOKEN=abcd1234
 * MAXX=50
 * MAXY=50
 */

require('dotenv').config();
const fs = require("fs");
const Discord = require("discord.js");
const client = new Discord.Client();
const boardhandler = require("./game/Board.js");
const jsonfile = require("./configs.json");
const datadir = path.join(__dirname, '..', 'data');
const {
  MinesweeperBoard
} = boardhandler;
const boardArray = {}; // Guild Id, Channel Id, X, (255 is board params [xSize, ySize, sMines, dMines, tMines, aMines]) Y, [Uncovered, Flag type, Mine type, totol of surrounding mines]

const maxBoardX = parseInt(process.env.MAXX);
const maxBoardY = parseInt(process.env.MAXY);

const defaultGuildSettings = {
  prefix: '>'
}

client.on("ready", () => {
  console.log("DPMS Bot v1.0");
  console.log("Initializing...");
  var bot = new MinesweeperBot();
  console.log("done");
  console.log("Thanks to MrMelon54 and Blananas2");
  bot.start();
});

client.on("message", message => {
  var config = getPerServerSettings(message.guild.id.toString());
  if (message.content.startsWith(config.prefix) && !message.content.startsWith(`${config.prefix} `)) {
    processCommand(message);
  }
});

updateStatus() {
  client.user.setStatus("online");
  client.user.setActivity(jsonfile.status.activity, {
    type: jsonfile.status.presence.toUpperCase()
  });
}

getPerServerSettings(guildId) {
  var pathForGuildSettings = path.join(datadir, 'GuildSettings', guildId.replace(/[^a-zA-Z0-9]/g, '') + '.json');
  if (fs.existsSync(pathForGuildSettings)) {
    return {
      ...require(pathForGuildSettings)
    };
  } else {
    return {
      ...defaultGuildSettings
    };
  }
}

class MinesweeperBot {
  constructor(maxBoardX, maxBoardY, jsonfile, datadir) {
    [this.maxBoardX, this.maxBoardY, this.jsonfile, this.datadir] = [maxBoardX, maxBoardY, jsonfile, datadir];
  }

  start() {
    
  }

  processCommand(receivedMessage) {
    let fullCommand = receivedMessage.content.substr(1); // Remove the leading exclamation mark
    let splitCommand = fullCommand.split(" "); // Split the message up in to pieces for each space
    let primaryCommand = splitCommand[0].toLowerCase(); // The first word directly after the exclamation is the command
    let arguments = splitCommand.slice(1); // All other words are arguments/parameters/options for the command
    try {
      var pathForCommandFile = path.join(__dirname, 'commands', primaryCommand.replace(/[^a-zA-Z0-9]/g, '') + '.js');
      if (fs.existsSync(pathForCommandFile)) {
        var commandScript = require(pathForCommandFile);
        if (commandScript.hasOwnProperty('command')) {
          return commandScript.command(this, arguments);
        }
      }
      receivedMessage.channel.send("Unknown command. Use >help for help.");
    } catch (err) {
      if (err.message !== "Failed: bomb exploded") {
        if (err.message.indexOf("Error: ") == 0) {
          receivedMessage.channel.send(
            new Discord.RichEmbed()
            .setColor("#ff0000")
            .setAuthor("Uh Oh...")
            .setTitle(err.message.slice(7, err.message.length))
          );
        } else {
          receivedMessage.channel.send(
            "A fault occured :sob: Please inform my developer"
          );
          console.error(err);
        }
      }
    }
  }

  bombExplode(guildId, channelId) {
    displayBoard(guildId, channelId, (exploded = true));
    delete boardArray[guildId][channelId];
    throw new Error("Failed: bomb exploded");
  }

  gameWin(guildId, channelId) {
    displayBoard(guildId, channelId, (won = true));
    delete boardArray[guildId][channelId];
  }

  fillNumbers(guildId, channelId) {
    var b = boardArray[guildId][channelId];
    for (var i = 0; i < b[255][0]; i++) {
      for (var j = 0; j < b[255][1]; j++) {
        boardArray[guildId][channelId][i][j][3] = findMines(
          guildId,
          channelId,
          i,
          j
        );
      }
    }
  }

  findMines(guildId, channelId, x, y) {
    var toCheck = [
      [x - 1, y - 1],
      [x - 1, y],
      [x - 1, y + 1],
      [x, y - 1],
      [x, y + 1],
      [x + 1, y - 1],
      [x + 1, y],
      [x + 1, y + 1]
    ];
    var cellType = 255;
    for (var i = 0; i < toCheck.length; i++) {
      if (
        toCheck[i][0] < 0 ||
        toCheck[i][1] < 0 ||
        toCheck[i][0] >= boardArray[guildId][channelId][255][0] ||
        toCheck[i][1] >= boardArray[guildId][channelId][255][1]
      )
        continue;
      switch (boardArray[guildId][channelId][toCheck[i][0]][toCheck[i][1]][2]) {
        case -1:
          if (cellType == 255) cellType = 0;
          cellType--;
          break;
        case 1:
          if (cellType == 255) cellType = 0;
          cellType++;
          break;
        case 2:
          if (cellType == 255) cellType = 0;
          cellType += 2;
          break;
        case 3:
          if (cellType == 255) cellType = 0;
          cellType += 3;
          break;
      }
    }
    return cellType;
  }

  floodFill(guildId, channelId, posX, posY, cells = []) {
    var toCheck = [
      [posX, posY]
    ];
    var i = -1;
    while (i < toCheck.length - 1) {
      i++;
      if (
        toCheck[i][0] < 0 ||
        toCheck[i][0] >= boardArray[guildId][channelId][255][0]
      )
        continue;
      if (
        toCheck[i][1] < 0 ||
        toCheck[i][1] >= boardArray[guildId][channelId][255][1]
      )
        continue;
      var cell = boardArray[guildId][channelId][toCheck[i][0]][toCheck[i][1]];
      if (cell[1] == 0) {
        cells.push(toCheck[i]);
        boardArray[guildId][channelId][toCheck[i][0]][toCheck[i][1]][0] = 1;
      }
      if (cell[2] != 0) {
        return bombExplode(guildId, channelId);
      }
      if (cell[1] == 0 && cell[2] == 0 && cell[3] == 255) {
        // check if cell is blank
        var x = toCheck[i][0];
        var y = toCheck[i][1];
        if (!floodFillChecker(toCheck, [x - 1, y - 1]))
          toCheck.push([x - 1, y - 1]);
        if (!floodFillChecker(toCheck, [x - 1, y])) toCheck.push([x - 1, y]);
        if (!floodFillChecker(toCheck, [x - 1, y + 1]))
          toCheck.push([x - 1, y + 1]);
        if (!floodFillChecker(toCheck, [x, y - 1])) toCheck.push([x, y - 1]);
        if (!floodFillChecker(toCheck, [x, y + 1])) toCheck.push([x, y + 1]);
        if (!floodFillChecker(toCheck, [x + 1, y - 1]))
          toCheck.push([x + 1, y - 1]);
        if (!floodFillChecker(toCheck, [x + 1, y])) toCheck.push([x + 1, y]);
        if (!floodFillChecker(toCheck, [x + 1, y + 1]))
          toCheck.push([x + 1, y + 1]);
      }
    }
    return cells;
  }

  floodFillChecker(arr, pos) {
    return arr.some(d => JSON.stringify(d) === JSON.stringify(pos));
  }

  randomMine() {
    return Math.floor(Math.random() * 4 + 1);
  }

  flagToInt(flagType) {
    switch (flagType.toLowerCase()) {
      case "s":
        return 1;
      case "d":
        return 2;
      case "t":
        return 3;
      case "a":
        return 4;
      default:
        throw new Error("Error: Invalid flag type");
    }
  }

  cellA1ToIndex(cellA1) {
    // Use regex match to find column & row references.
    // Must start with letters, end with numbers.
    cellA1 = cellA1.toUpperCase();
    var match = /^([A-Z]+)([0-9]+)$/gm.exec(cellA1);

    if (match == null) throw new Error("Error: Invalid cell reference");

    var colA1 = match[1];
    var rowA1 = match[2];

    return {
      row: rowA1ToIndex(rowA1),
      col: colA1ToIndex(colA1)
    };
  }

  colA1ToIndex(colA1) {
    if (typeof colA1 !== "string" || colA1.length > 2)
      throw new Error("Error: Expected column label.");

    var A = "A".charCodeAt(0);
    var number = colA1.charCodeAt(colA1.length - 1) - A;
    if (colA1.length == 2) {
      number += 26 * (colA1.charCodeAt(0) - A + 1);
    }
    return number;
  }

  rowA1ToIndex(rowA1) {
    return rowA1 - 1;
  }

  // thanks, melon :)
  // no problemo bro xD
  displayBoard(guildId, channelId) {
    // temporary print script
    /*var o = [];
    var k = Object.keys(boardArray[guildId][channelId]);
    for (var l = 0; l < k.length; l++) {
      if (k[l].toString() == "255") o.push("Data: " + JSON.stringify(boardArray[guildId][channelId][k[l]]));
      else o.push(boardArray[guildId][channelId][k[l]].map(x => JSON.stringify(x)).join(" | "));
    }
    client.guilds
      .get(guildId)
      .channels.get(channelId)
      .send(o.join("\n"));*/

    if (boardArray[guildId][channelId] === undefined) return;
    var g = [];
    for (var i = 0; i < boardArray[guildId][channelId][255][0]; i++) {
      g.push([]);
      for (var j = 0; j < boardArray[guildId][channelId][255][1]; j++) {
        g[i].push(calculateCurrentCellView(boardArray[guildId][channelId][i][j]));
      }
    }
    var b = new boardhandler.MinesweeperBoard(
      g,
      boardArray[guildId][channelId][255][1],
      boardArray[guildId][channelId][255][0]
    );
    if (won == true) {
      b.render(img => {
        client.guilds
          .get(guildId)
          .channels.get(channelId)
          .send(
            new Discord.RichEmbed()
            .setColor("#00ff00")
            .setAuthor("Congratulations!", jsonfile.logoGame)
            .attachFile(new Discord.Attachment(img, "minesweeperboard.png"))
            .setImage("attachment://minesweeperboard.png")
          );
      });
    } else if (exploded == true) {
      client.guilds
        .get(guildId)
        .channels.get(channelId)
        .send(generateBoardEmbed(boardArray, guildId, channelId))
        .then(m => {
          b.render(img => {
            m.delete();
            client.guilds
              .get(guildId)
              .channels.get(channelId)
              .send(
                new Discord.RichEmbed()
                .setColor("#ff0000")
                .setAuthor("You blew up.", jsonfile.logoGame)
                .attachFile(new Discord.Attachment(img, "minesweeperboard.png"))
                .setImage("attachment://minesweeperboard.png")
              );
          });
        });
    } else {
      client.guilds
        .get(guildId)
        .channels.get(channelId)
        .send(
          generateBoardEmbed(boardArray, guildId, channelId).addField(
            "Loading...",
            "(eta 3 years)"
          )
        )
        .then(m => {
          b.render(img => {
            m.delete();
            client.guilds
              .get(guildId)
              .channels.get(channelId)
              .send(
                generateBoardEmbed(boardArray, guildId, channelId)
                .attachFile(new Discord.Attachment(img, "minesweeperboard.png"))
                .setImage("attachment://minesweeperboard.png")
              );
          });
        });
    }
    // add code to make message here pls
  }

  generateBoardEmbed(boardArray, guildId, channelId) {
    return new Discord.RichEmbed()
      .setAuthor("Minesweeper!", jsonfile.logoGame)
      .setTitle(
        "Standard (" +
        boardArray[guildId][channelId][255][0] +
        "x" +
        boardArray[guildId][channelId][255][1] +
        ")"
      )
      .setDescription(">dig [A1] to dig | >flag [A1] (S,D,T,A) to flag")
      .addField(
        "Mines:",
        "Single: " +
        flaggedMines(guildId, channelId, 1) +
        "/" +
        boardArray[guildId][channelId][255][2] +
        " | Double: " +
        flaggedMines(guildId, channelId, 2) +
        "/" +
        boardArray[guildId][channelId][255][3] +
        " | Triple: " +
        flaggedMines(guildId, channelId, 3) +
        "/" +
        boardArray[guildId][channelId][255][4] +
        " | Anti: " +
        flaggedMines(guildId, channelId, 4) +
        "/" +
        boardArray[guildId][channelId][255][5]
      );
  }

  flaggedMines(guildId, channelId, mineType) {
    var c = 0;
    var b = boardArray[guildId][channelId];
    for (var x = 0; x < b[255][0]; x++) {
      for (var y = 0; y < b[255][1]; y++) {
        if (b[x][y][1] == mineType) c++;
      }
    }
    return c;
  }

  calculateCurrentCellView(cell, showExploded = true) {
    if (cell[0]) {
      switch (cell[2]) {
        case 1:
          return (showExploded ? "x" : "") + "bomb-s";
        case 2:
          return (showExploded ? "x" : "") + "bomb-d";
        case 3:
          return (showExploded ? "x" : "") + "bomb-t";
        case -1:
          return (showExploded ? "x" : "") + "bomb-a";
        default:
          if (cell[3] == 255) return "blank";
          return "cell" + cell[3];
      }
    } else {
      switch (cell[1]) {
        case 1:
          return "flag-s";
        case 2:
          return "flag-d";
        case 3:
          return "flag-t";
        case 4:
          return "flag-a";
        default:
          return "hidden";
      }
    }
  }
}

// login stuffs
client.login(process.env.TOKEN);