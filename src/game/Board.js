const Discord = require("discord.js");
const Jimp = require("jimp");
const ndarray = require("ndarray");
const Cell = require('./Cell');
const randomgen = require('../utils/randomgen');
const { promises : fs } = require("fs");
const path = require('path');

class MinesweeperBoard {
  constructor(bot, boardId, guildId, channelId, width, height, seed, texturepack) {
    this.board = ndarray([], [width, height]);
    this.seed = seed;
    this.r = new randomgen(seed);
    this.width = width;
    this.height = height;
    this.id = boardId;
    this.guildId = guildId;
    this.channelId = channelId;
    this.texturepack = texturepack;
    this.bot = bot;
    this.won = false;
    this.exploded = false;
    this.cached = null;

    for (var i = 0; i < this.width; i++)
      for (var j = 0; j < this.height; j++)
        this.board.set(i, j, new Cell(this));
  }

  get(x, y) {
    return this.board.get(x, y);
  }

  async getChannel() {
    try {
      return await this.bot.getChannel(this.channelId);
    } catch (err) {
      throw new Error("Error: unable to find channel");
    }
  }

  getRawData() {
    return {
      board: this.board.data,
      seed: {base: this.seed, live: this.r.live},
      width: this.width,
      height: this.height,
      id: this.id,
      guildId: this.guildId,
      channelId: this.channelId,
      texturepack: this.texturepack,
      won: this.won,
      exploded: this.exploded
    }
  }

  loadRawData(d) {
    this.board = d.board;
    this.seed = d.seed.base;
    this.live = d.seed.live;
    this.width = d.width;
    this.height = d.height;
    this.id = d.id;
    this.guildId = d.guildId;
    this.channelId = d.channelId;
    this.texturepack = d.texturepack;
    this.won = d.won;
    this.exploded = d.exploded;
  }

  save() {
    let $t=this;
    fs.writeFile(path.join($t.bot.boardDataPath,$t.id+".json"), JSON.stringify($t.getRawData()), { encoding: 'utf8' }).then(() => {
      /* Ignore cuz it saved fine */
    }).catch((err)=>{
      console.error(`Failed to save board ${$t.id} lol`);
      console.error(err);
    });
  }

  async render() {
    var $t = this;
    var tp = $t.bot.getAssets().find($t.texturepack);
    if (tp == null) return "invalid texturepack";
    var textures = await tp.use();
    try {
      var baseimg;
      if(this.cached == null) {
        baseimg = new Jimp(16 * ($t.width + 2), 16 * ($t.height + 2));
        var borderRightEdge = ($t.width + 1) * 16;
        var borderBottomEdge = ($t.height + 1) * 16;

        // Border corners
        var cornerIcon = await textures.getBorderCorner();
        baseimg.composite(cornerIcon, 0, 0);
        baseimg.composite(cornerIcon, borderRightEdge, 0);
        baseimg.composite(cornerIcon, 0, borderBottomEdge);
        baseimg.composite(cornerIcon, borderRightEdge, borderBottomEdge);

        // Border letters
        for (var x = 0; x < $t.width; x++) {
          var letterIcon = await textures.getBorder(letterVal(x));
          if (letterIcon == null) letterIcon = textures.getDebugTile();
          var letterPosition = (1 + x) * 16;
          baseimg.composite(letterIcon, letterPosition, 0);
          baseimg.composite(letterIcon, letterPosition, borderBottomEdge);
        }
        for (var y = 0; y < $t.height; y++) {
          var numberIcon = await textures.getBorder(y + 1);
          if (numberIcon == null) numberIcon = textures.getDebugTile();
          var numberPosition = (1 + y) * 16;
          baseimg.composite(numberIcon, 0, numberPosition);
          baseimg.composite(numberIcon, borderRightEdge, numberPosition);
        }

        this.cached = baseimg;
      }
      baseimg = this.cached.clone();

      // Drawing cells in the middle
      for (var x = 0; x < $t.width; x++)
        for (var y = 0; y < $t.height; y++) {
          var cell = $t.get(x, y);
          var view = await $t.calculateCurrentCellView(textures, cell, $t.exploded);
          baseimg.composite(view == null ? await textures.getDebugPinkBlack() : view, (1 + x) * 16, (1 + y) * 16);
        }

      var finalImage = baseimg.resize(baseimg.bitmap.width * 8, Jimp.AUTO, Jimp.RESIZE_NEAREST_NEIGHBOR);
      return await finalImage.getBufferAsync(Jimp.MIME_PNG);
    } catch (err) {
      console.error("Issue creating new image in memory");
      console.error(err);
      return null;
    }
  }

  generate(totalMineCounts) {
    var $t = this,
      xRand = 0,
      yRand = 0,
      regenMine = true,
      totalMines = 0;

    for (var i = 0; i < $t.width; i++)
      for (var j = 0; j < $t.height; j++)
        this.board.set(i, j, new Cell($t));

    this.totalMineCounts = totalMineCounts;
    var mineCounts = {
      ...totalMineCounts
    };
    var allowedMines = Object.keys(mineCounts);
    for (var i = 0; i < allowedMines.length; i++) {
      mineCounts[allowedMines[i]] = 0;
      totalMines += totalMineCounts[allowedMines[i]];
    }

    // Sanity checks xD
    if (this.width * this.height <= totalMines) throw new Error("Error: Too many mines for the board!");
    if (totalMines < 1) throw new Error("Error: Not enough mines on the board!");

    var previousMineCoords = [];
    for (var i = 0; i < totalMines; i++) {
      xRand = this.r.getInt(this.width-1);
      yRand = this.r.getInt(this.height-1);
      while (previousMineCoords.filter(x => x[0] == xRand && x[1] == yRand).length >= 1) {
        xRand = this.r.getInt(this.width-1);
        yRand = this.r.getInt(this.height-1);
      }
      regenMine = true;
      while (regenMine == true) {
        var randMine = $t.randomMine(allowedMines);
        if (mineCounts[randMine] >= totalMineCounts[randMine]) regenMine = true;
        else {
          mineCounts[randMine]++;
          regenMine = false;
        }
      }
      $t.get(xRand, yRand).mine = parseInt(randMine);
      previousMineCoords.push([xRand, yRand]);
    }
  }

  bombExplode() {
    this.exploded = true;
    this.displayBoard();
    this.delete();
    throw new Error("Failed: bomb exploded");
  }

  gameWin() {
    this.won = true;
    this.displayBoard();
    this.delete();
    return true;
  }

  delete() {
    this.bot.deleteBoard(this.id);
  }

  detectWin() {
    var $t = this;
    var totalNonMines = 0;
    var totalUncovered = 0;
    for (var i = 0; i < $t.width; i++) {
      for (var j = 0; j < $t.height; j++) {
        if ($t.get(i, j).mine == 0) totalNonMines++;
        if ($t.get(i, j).visible) totalUncovered++;
        if ($t.get(i, j).flagged) totalUncovered--;
      }
    }
    if (totalNonMines == totalUncovered) return $t.gameWin();
    return false;
  }

  // TODO: find all the mines and set the numbers around them
  fillNumbers() {
    var $t = this;
    for (var i = 0; i < $t.width; i++)
      for (var j = 0; j < $t.height; j++)
        $t.get(i, j).number = $t.findMines(i, j);
  }

  findMines(x, y) {
    var $t = this,
      toCheck = [
        [x, y - 1], // top middle
        [x - 1, y - 1], // top left
        [x - 1, y], // left middle
        [x - 1, y + 1], // bottom left
        [x, y + 1], // bottom middle
        [x + 1, y - 1], // top right
        [x + 1, y], // right middle
        [x + 1, y + 1] // bottom right
      ];
    var cellType = Number.MAX_SAFE_INTEGER;
    for (var i = 0; i < toCheck.length; i++) {
      if (toCheck[i][0] < 0 || toCheck[i][1] < 0 || toCheck[i][0] >= $t.width || toCheck[i][1] >= $t.height) continue;
      var n = $t.get(toCheck[i][0], toCheck[i][1]).mine;
      if (n == 0) continue;
      if (cellType == Number.MAX_SAFE_INTEGER) cellType = 0;
      cellType += n;
    }
    return cellType;
  }

  floodFill(posX, posY, cells = []) {
    var $t = this,
      toCheck = [
        [posX, posY]
      ];
    var i = -1;
    while (i < toCheck.length - 1) {
      i++;
      if (toCheck[i][0] < 0 || toCheck[i][0] >= $t.width || toCheck[i][1] < 0 || toCheck[i][1] >= $t.height) continue;
      var cell = $t.get(toCheck[i][0], toCheck[i][1]);
      if (cell.flag == 0) {
        cells.push(toCheck[i]);
        $t.get(toCheck[i][0], toCheck[i][1]).visible = true;
      }
      if (cell.mine != 0) {
        return bombExplode(guildId, channelId);
      }
      if (cell.flag == 0 && cell.mine == 0 && cell.number == Number.MAX_SAFE_INTEGER) {
        // check if cell is blank
        var x = toCheck[i][0];
        var y = toCheck[i][1];
        if (!$t.floodFillChecker(toCheck, [x - 1, y - 1])) toCheck.push([x - 1, y - 1]);
        if (!$t.floodFillChecker(toCheck, [x - 1, y])) toCheck.push([x - 1, y]);
        if (!$t.floodFillChecker(toCheck, [x - 1, y + 1])) toCheck.push([x - 1, y + 1]);
        if (!$t.floodFillChecker(toCheck, [x, y - 1])) toCheck.push([x, y - 1]);
        if (!$t.floodFillChecker(toCheck, [x, y + 1])) toCheck.push([x, y + 1]);
        if (!$t.floodFillChecker(toCheck, [x + 1, y - 1])) toCheck.push([x + 1, y - 1]);
        if (!$t.floodFillChecker(toCheck, [x + 1, y])) toCheck.push([x + 1, y]);
        if (!$t.floodFillChecker(toCheck, [x + 1, y + 1])) toCheck.push([x + 1, y + 1]);
      }
    }
    return cells;
  }

  floodFillChecker(arr, pos) {
    return arr.some(d => JSON.stringify(d) === JSON.stringify(pos));
  }

  randomMine(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  flagHashToIndex(text) {
    var $t = this;
    if (/^\&.+/.test(text)) return $t.bot.getFlag(text.slice(1));
    else throw new Error("Error: Invalid flag name/number");
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
      row: this.rowA1ToIndex(rowA1),
      col: this.colA1ToIndex(colA1)
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
  displayBoard() {
    var $t = this;
    if ($t.won) {
      $t.render().then(img => {
        $t.getChannel().then(channel => channel.send(
          new Discord.MessageEmbed()
          .setColor("#00ff00")
          .setAuthor("Congratulations!", $t.bot.jsonfile.logoGame)
          .attachFiles([new Discord.MessageAttachment(img, "minesweeperboard.png")])
          .setImage("attachment://minesweeperboard.png")
        )).catch(reason => {
          console.error(reason);
        });
      });
    } else if ($t.exploded) {
      $t.getChannel().then(channel => channel.send($t.generateBoardEmbed())
        .then(m => {
          $t.render().then(img => {
            m.delete().catch(reason => {
              console.error(reason);
            });
            channel.send(new Discord.MessageEmbed()
              .setColor("#ff0000")
              .setAuthor("You blew up.", $t.bot.jsonfile.logoGame)
              .attachFiles([new Discord.MessageAttachment(img, "minesweeperboard.png")])
              .setImage("attachment://minesweeperboard.png")).catch(reason => {
              console.error(reason);
            });
          });
        }).catch(reason => {
          console.error(reason);
        })).catch(reason => {
        console.error(reason);
      });
    } else {
      $t.getChannel().then(channel => channel.send($t.generateBoardEmbed().addField(
          "Loading...",
          "(eta 3 years)"
        ))
        .then(m => {
          $t.render().then(img => {
            m.delete().catch(reason => {
              console.error(reason);
            })
            channel.send($t.generateBoardEmbed()
              .attachFiles([new Discord.MessageAttachment(img, "minesweeperboard.png")])
              .setImage("attachment://minesweeperboard.png")).catch(reason => {
              console.error(reason);
            });
          });
        }).catch(reason => {
          console.error(reason);
        })).catch(reason => {
        console.error(reason);
      });
    }
    // add code to make message here pls
  }

  generateBoardEmbed() {
    var $t = this;
    return new Discord.MessageEmbed()
      .setAuthor("Minesweeper!", $t.bot.jsonfile.logoGame)
      .setTitle(`Standard (${$t.width}x${$t.height})`)
      //.setDescription(">dig [A1] to dig | >flag [A1] (S,D,T,A) to flag")
      .addField("Seed:", this.seed)
      .addField("Mines:", $t.getMineEmbedContent());
  }

  getMineEmbedContent() {
    let o=[];
    let mines = this.bot.getMines();

    let k = Object.keys(this.totalMineCounts);
    for(let i=0;i<k.length;i++) {
      let f = mines.filter(x=>x.id == k[i]);
      if(f.length > 0) {
        o.push(`${this.totalMineCounts[k[i]]} x ${f[0].name}`);
      }
    }

    return o.join('\n');
  }

  flaggedMines() {
    var $t = this,
      c = 0;
    for (var x = 0; x < $t.width; x++) {
      for (var y = 0; y < $t.height; y++) {
        if ($t.get(x, y).flagged) c++;
      }
    }
    return c;
  }

  async calculateCurrentCellView(textures, cell, showExploded = true) {
    if (showExploded && cell.mined) {
      if (cell.visible) return await textures.getMine(cell.mine);
      else return await textures.getRedExclamationMark();
    }
    if (!cell.visible) return await textures.raisedCell();
    if (cell.flagged) return await textures.getFlag(cell.flag);
    if (cell.mined) return await textures.getMine(cell.mine);
    if (cell.number == Number.MAX_SAFE_INTEGER) return await textures.loweredCell();
    return await textures.getNumberWithPaletteColor(cell.number);
  }
}
/**
 * Thx stackoverflow
 * You are the best
 * https://stackoverflow.com/a/32007970/10719432
 */
function letterVal(i) {
  return (i >= 26 ? letterVal(((i / 26) >> 0) - 1) : "") + "abcdefghijklmnopqrstuvwxyz" [i % 26 >> 0];
}

module.exports = MinesweeperBoard;
