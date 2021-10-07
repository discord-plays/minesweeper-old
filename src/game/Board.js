const Discord = require("discord.js");
const Jimp = require("jimp");
const ndarray = require("ndarray");
const Cell = require('./Cell');
const randomgen = require('../utils/randomgen');
const { promises : fs } = require("fs");
const path = require('path');

class MinesweeperBoard {
  static id = "vanilla";
  static hideSizeOptions = false;

  constructor(bot, boardId, guildId = null, channelId = null, userId = null, width, height, seed, isCustomSeed, texturepack, startTime, totalTime, missionName = null) {
    this.customBoardId = MinesweeperBoard.id;
    this.running = false;

    if (guildId === null && channelId === null && userId === null) {
      // smaller constructor for reloading board
      this.id = boardId;
      this.bot = bot;
      this.cached = null;
      this.hadError = true;
    } else {
      this.board = ndarray([], [width, height]);
      this.seed = seed;
      this.isCustomSeed = isCustomSeed;
      this.r = new randomgen(seed);
      this.width = width;
      this.height = height;
      this.id = boardId;
      this.guildId = guildId;
      this.channelId = channelId;
      this.userId = userId;
      this.texturepack = texturepack;
      this.bot = bot;
      this.won = false;
      this.exploded = false;
      this.outOfTime = false;
      this.cached = null;
      this.hadError = false;
      this.missionName = missionName;
      this.startTime = startTime;
      this.totalTime = totalTime;

      for (var i = 0; i < this.width; i++) for (var j = 0; j < this.height; j++) this.board.set(i, j, new Cell(this));
    }
  }

  get(x, y) {
    return this.board.get(x, y);
  }

  async getChannel() {
    try {
      if (this.guildId == "dm") {
        let dm = await this.bot.getDMChannel(this.userId);
        this.channelId = dm.id;
        return dm;
      } else return await this.bot.getChannel(this.channelId);
    } catch (err) {
      console.error(err);
      throw new Error("Error: unable to find channel");
    }
  }

  getRawData() {
    return {
      customBoardId: this.customBoardId || "vanilla",
      board: this.board.data,
      seed: { base: this.seed, live: this.r.live, custom: this.isCustomSeed },
      width: this.width,
      height: this.height,
      id: this.id,
      guildId: this.guildId,
      channelId: this.channelId,
      userId: this.userId,
      texturepack: this.texturepack,
      won: this.won,
      exploded: this.exploded,
      outOfTime: this.outOfTime,
      totalMineCounts: this.totalMineCounts,
      hadError: this.hadError,
      missionName: this.missionName,
      startTime: this.startTime.getTime(),
      totalTime: this.totalTime,
    };
  }

  loadRawData(d) {
    let $t = this;
    this.customBoardId = d.customBoardId || "vanilla";
    this.board = ndarray(
      d.board.map((x) => {
        if (x instanceof Cell) {
          return x;
        } else {
          let y = new Cell($t);
          y.mine = $t.bot.getMineById(x[0]);
          y.flag = $t.bot.getFlagById(x[1]);
          y.number = x[2] === null ? Number.MAX_SAFE_INTEGER : x[2];
          y.visible = x[3];
          y.extra = x[4];
          return y;
        }
      }),
      [d.width, d.height]
    );
    this.seed = d.seed.base;
    this.isCustomSeed = d.seed.custom;
    this.r = new randomgen(d.seed.base, d.seed.live);
    this.width = d.width;
    this.height = d.height;
    this.guildId = d.guildId;
    this.channelId = d.channelId;
    this.userId = d.userId;
    this.texturepack = d.texturepack;
    this.won = d.won;
    this.exploded = d.exploded;
    this.outOfTime = d.outOfTime;
    this.totalMineCounts = d.totalMineCounts;
    this.hadError = d.hadError;
    this.missionName = d.missionName;
    this.startTime = new Date(d.startTime);
    this.totalTime = d.totalTime;
  }

  timerCheck() {
    if(!this.running || this.outOfTime || this.won || this.exploded) return;
    if (this.startTime.getTime() + this.totalTime * 1000 <= new Date().getTime()) {
      this.timerEnd();
    }
  }

  timerEnd() {
    this.outOfTime = true;
    this.getChannel().then((x) => this.displayBoard({ reply: (y) => x.send(y) }));
    this.delete();
  }

  save() {
    let $t = this;
    fs.writeFile(path.join($t.bot.boardDataPath, $t.id + ".json"), JSON.stringify($t.getRawData()), { encoding: "utf8" })
      .then(() => {
        /* Ignore cuz it saved fine */
      })
      .catch((err) => {
        console.error(`Failed to save board ${$t.id} lol`);
        console.error(err);
      });
  }

  load() {
    let $t = this;
    return new Promise((resolve, reject) => {
      fs.readFile(path.join($t.bot.boardDataPath, $t.id + ".json"), { encoding: "utf8" })
        .then((d) => {
          $t.loadRawData(JSON.parse(d));
          $t.postLoad()
            .then((x) => {
              resolve();
            })
            .catch((reason) => {
              reject(reason);
            });
        })
        .catch((err) => {
          console.error(`Failed to load board ${$t.id} lol`);
          console.error(err);
          reject(err);
        });
    });
  }

  postLoad(isMoved = false, usersToInvite = null) {
    let $t = this;
    let z = {};
    if (usersToInvite != null) z.content = usersToInvite.join(" ");
    this.running = true;
    return new Promise((resolve, reject) => {
      $t.getChannel()
        .then((x) => {
          var embed1 = new Discord.MessageEmbed()
            .setColor("#9D2230")
            .setAuthor("Minesweeper!", $t.bot.jsonfile.logoQuestion)
            .setTitle("Reloading Game")
            .setDescription([isMoved ? "The board was moved from another channel and is being loaded from its last state" : "The bot was restarted and this board is being loaded from the last saved state.", "The board will be displayed when it is ready."].join("\n"));

          // This is probably just a hack?
          x.send({ ...z, embeds: [embed1] }).then((m) => {
            $t.displayBoard({
              reply: (a) => {
                m.edit({ ...z, embeds: [embed1, ...a.embeds], files: a.files });
                return new Promise((resolve, reject) => {
                  resolve({
                    edit: (a) => {
                      return m.edit({ ...z, embeds: [embed1, ...a.embeds], files: a.files });
                    },
                  });
                });
              },
            });
            resolve();
          });
        })
        .catch((err) => {
          console.error(`Failed to load channel for board: ${$t.id}`);
          console.error(err);
          reject(err);
        });
    });
  }

  async render() {
    var $t = this;
    var tp = $t.bot.getAssets().find($t.texturepack);
    if (tp == null) return "invalid texturepack";
    var textures = await tp.use();
    try {
      var baseimg;
      if (this.cached == null) {
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
          if (numberIcon == null) numberIcon = textures.getDebugPinkBlack();
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

  isInvalidCell(x, y) {
    return false;
  }

  generate(totalMineCounts) {
    var $t = this,
      xRand = 0,
      yRand = 0,
      regenMine = true,
      totalMines = 0;

    for (var i = 0; i < $t.width; i++) for (var j = 0; j < $t.height; j++) this.board.set(i, j, new Cell($t));

    this.totalMineCounts = totalMineCounts;
    var mineCounts = {
      ...totalMineCounts,
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
      xRand = this.r.getInt(this.width - 1);
      yRand = this.r.getInt(this.height - 1);
      while (this.isInvalidCell(xRand, yRand) || previousMineCoords.filter((x) => x[0] == xRand && x[1] == yRand).length >= 1) {
        xRand = this.r.getInt(this.width - 1);
        yRand = this.r.getInt(this.height - 1);
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
      $t.get(xRand, yRand).mine = this.bot.getMineById(randMine);
      previousMineCoords.push([xRand, yRand]);
    }
  }

  bombExplode(replyFunc) {
    this.exploded = true;
    this.displayBoard(replyFunc);
    this.delete();
    throw new Error("Failed: bomb exploded");
  }

  gameWin(replyFunc) {
    this.won = true;
    this.displayBoard(replyFunc);
    this.delete();
    return true;
  }

  delete() {
    let $t = this;
    let p = path.join($t.bot.boardDataPath, $t.id + ".json");
    fs.writeFile(p, "finished", { encoding: "utf8" })
      .then(() => {
        fs.rm(p)
          .then(() => {
            /* good vibes */
          })
          .catch((err) => {
            console.error(`Error deleting old board data for ${$t.id} but the old data was voided`);
            console.error(err);
          });
      })
      .catch((err) => {
        console.error(`Error void old board data for ${$t.id} this game could be regenerated at a previous state if the bot restarts`);
        console.error(err);
      });
    this.bot.deleteBoard(this.id);
  }

  detectWin(replyFunc) {
    var $t = this;
    var totalNonMines = 0;
    var totalUncovered = 0;
    for (var i = 0; i < $t.width; i++)
      for (var j = 0; j < $t.height; j++) {
        if (!$t.get(i, j).mined) totalNonMines++;
        if ($t.get(i, j).visible) totalUncovered++;
        if ($t.get(i, j).flagged) totalUncovered--;
      }
    if (totalNonMines == totalUncovered) return $t.gameWin(replyFunc);
    return false;
  }

  fillNumbers() {
    var $t = this;
    for (var i = 0; i < $t.width; i++) for (var j = 0; j < $t.height; j++) if ($t.get(i, j).mined) $t.fillNumbersForMine($t.get(i, j).mine, i, j, $t.width, $t.height);

    for (var i = 0; i < $t.width; i++)
      for (var j = 0; j < $t.height; j++) {
        let c = $t.get(i, j);
        if (!c.mined && !c.flagged)
          if (c.number == 69 && Math.random() < 0.000014493)
            // I think this means 1 in 69,000 chance
            c.extra = "69";
      }
  }

  fillNumbersForMine(mine, x, y, w, h) {
    var $t = this;
    let toZero = mine.default3x3Box(x, y, w, h);
    for (var i = 0; i < toZero.length; i++) {
      if (toZero[i][0] < 0 || toZero[i][1] < 0 || toZero[i][0] >= $t.width || toZero[i][1] >= $t.height) continue;
      let n = $t.get(toZero[i][0], toZero[i][1]);
      if (n.number == Number.MAX_SAFE_INTEGER) n.number = 0;
    }
    let toCheck = mine.affectedCells(x, y, w, h);
    for (var i = 0; i < toCheck.length; i++) {
      if (toCheck[i][0] < 0 || toCheck[i][1] < 0 || toCheck[i][0] >= $t.width || toCheck[i][1] >= $t.height) continue;
      let n = $t.get(toCheck[i][0], toCheck[i][1]);
      if (n.number == Number.MAX_SAFE_INTEGER) n.number = 0;
      let newExtra = mine.calculateExtra(n.number);
      n.extra = newExtra || n.extra;
      n.number = mine.calculateValue(n.number);
    }
  }

  floodFill(posX, posY, cells = []) {
    var $t = this,
      toCheck = [[posX, posY]];
    var i = -1;
    while (i < toCheck.length - 1) {
      i++;
      if (toCheck[i][0] < 0 || toCheck[i][0] >= $t.width || toCheck[i][1] < 0 || toCheck[i][1] >= $t.height) continue;
      var cell = $t.get(toCheck[i][0], toCheck[i][1]);
      if (!cell.flagged) {
        cells.push(toCheck[i]);
        $t.get(toCheck[i][0], toCheck[i][1]).visible = true;
      }
      if (cell.mined) throw new Error("Failed: bomb exploded");
      if (!cell.flagged && !cell.mined && cell.number == Number.MAX_SAFE_INTEGER) {
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
    return arr.some((d) => JSON.stringify(d) === JSON.stringify(pos));
  }

  randomMine(arr) {
    return arr[this.r.getInt(arr.length - 1)];
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
      col: this.colA1ToIndex(colA1),
    };
  }

  colA1ToIndex(colA1) {
    if (typeof colA1 !== "string" || colA1.length > 2) throw new Error("Error: Expected column label.");

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
  displayBoard(replyFunc) {
    var $t = this;
    if ($t.won) {
      if (this.finishTime == undefined) this.finishTime = new Date();
      $t.render().then((img) => {
        let embed = new Discord.MessageEmbed().setColor("#00ff00").setAuthor("Congratulations!", $t.bot.jsonfile.logoGame).setImage("attachment://minesweeperboard.png");
        if ($t.totalTime > 0) embed.addField("Time remaining:", `${$t.getTimeRemaining(this.finishTime)}`);
        embed.addField("Time taken:", `${$t.getTimeTaken(this.finishTime)}`);
        replyFunc
          .reply({
            embeds: [embed],
            files: [new Discord.MessageAttachment(img, "minesweeperboard.png")],
          })
          .catch((reason) => {
            console.error(reason);
          });
      });
    } else if ($t.exploded) {
      if (this.finishTime == undefined) this.finishTime = new Date();
      replyFunc
        .reply({ embeds: [$t.generateBoardEmbed()] })
        .then((m) => {
          $t.render()
            .then((img) => {
              let embed = new Discord.MessageEmbed().setColor("#ff0000").setAuthor("You blew up.", $t.bot.jsonfile.logoGame).setImage("attachment://minesweeperboard.png");
              embed.addField("Time taken:", `${$t.getTimeTaken(this.finishTime)}`);
              let data = {
                embeds: [embed],
                files: [new Discord.MessageAttachment(img, "minesweeperboard.png")],
              };
              if (replyFunc.editReply)
                replyFunc.editReply(data).catch((reason) => {
                  console.error(reason);
                });
              else
                m.edit(data).catch((reason) => {
                  console.error(reason);
                });
            })
            .catch((reason) => {
              console.error(reason);
            });
        })
        .catch((reason) => {
          console.error(reason);
        });
    } else if ($t.outOfTime) {
      if (this.finishTime == undefined) this.finishTime = new Date();
      replyFunc
        .reply({ embeds: [$t.generateBoardEmbed()] })
        .then((m) => {
          $t.render()
            .then((img) => {
              let embed = new Discord.MessageEmbed().setColor("#ff0000").setAuthor("You ran out of time.", $t.bot.jsonfile.logoGame).setImage("attachment://minesweeperboard.png");
              embed.addField("Time taken:", `${$t.getTimeTaken(this.finishTime)}`);
              let data = {
                embeds: [embed],
                files: [new Discord.MessageAttachment(img, "minesweeperboard.png")],
              };
              if (replyFunc.editReply)
                replyFunc.editReply(data).catch((reason) => {
                  console.error(reason);
                });
              else
                m.edit(data).catch((reason) => {
                  console.error(reason);
                });
            })
            .catch((reason) => {
              console.error(reason);
            });
        })
        .catch((reason) => {
          console.error(reason);
        });
    } else {
      replyFunc
        .reply({ embeds: [$t.generateBoardEmbed().addField("Loading...", "(eta 3 years)")] })
        .then((m) => {
          $t.render()
            .then((img) => {
              let data = {
                files: [new Discord.MessageAttachment(img, "minesweeperboard.png")],
                embeds: [$t.generateBoardEmbed().setImage("attachment://minesweeperboard.png")],
              };
              if (replyFunc.editReply)
                replyFunc.editReply(data).catch((reason) => {
                  console.error(reason);
                });
              else
                m.edit(data).catch((reason) => {
                  console.error(reason);
                });
            })
            .catch((reason) => {
              console.error(reason);
            });
        })
        .catch((reason) => {
          console.error(reason);
        });
    }
    // add code to make message here pls
  }

  generateBoardEmbed() {
    var $t = this;
    let mineContent = $t.getMineEmbedContent();
    let embed = new Discord.MessageEmbed();
    embed.setAuthor("Minesweeper!", $t.bot.jsonfile.logoGame);
    embed.setTitle(`Standard (${$t.width}x${$t.height})`);
    embed.setDescription($t.bot.generateTip());
    embed.addField("Seed:", `${$t.seed}${$t.isCustomSeed ? " (seeded)": ""}`, true);
    if ($t.missionName != null && $t.missionName.trim() != "") embed.addField("Mission:", `${$t.missionName}`, true);
    embed.addField("Starting time:", $t.startTime.toString());
    if ($t.totalTime > 0) embed.addField("Time remaining:", `${$t.getTimeRemaining()}`);
    else embed.addField("Time taken:", `${$t.getTimeTaken()}`);
    embed.addField("Mines:", mineContent.trim() == "" ? "no mines?" : mineContent);
    return embed;
  }

  getTimeRemaining(currentTime = new Date()) {
    // I hate working with dates and times
    let finishTime = new Date(this.startTime.getTime());
    finishTime.setSeconds(finishTime.getSeconds() + this.totalTime);
    let t = Math.floor(Math.abs(finishTime - currentTime) / 1000);
    if (this.totalTime == 0) return null;
    return this.timeToString(t);
  }

  getTimeTaken(currentTime = new Date()) {
    let t = Math.floor(Math.abs(currentTime - this.startTime) / 1000);
    return `+ ${this.timeToString(t)}`;
  }

  timeToString(t) {
    if (t < 60) return `${t} seconds`;
    if (t / 60 < 60) return `${Math.floor(t / 60)} minutes ${t % 60} seconds`;
    if (t / 3600 < 60) return `${Math.floor(t / 3600)}:${Math.floor(t / 60) % 60}:${t % 60} hours`;
    if (t / 3600 < 24) return `${this.numberOfHoursString(t)} hours`;
    return `${Math.floor(t / 86400)} days ${this.numberOfHoursString(t)} hours`;
  }

  numberOfHoursString(t) {
    return `${Math.floor(t / 3600) % 24}:${(Math.floor(t / 60) % 60).toString().padStart(2, "0")}:${(t % 60).toString().padStart(2, "0")}`;
  }

  getMineEmbedContent() {
    let o = [];
    let mines = this.bot.getMines();

    let k = Object.keys(this.totalMineCounts);
    for (let i = 0; i < k.length; i++) {
      let f = mines.filter((x) => x.id == k[i]);
      if (f.length > 0) {
        o.push(`${this.totalMineCounts[k[i]]} x ${f[0].name} (${f[0].alias.map((x) => `&${x}`).join(", ")}) []`);
      }
    }

    return o.join("\n");
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
    if (cell.extra == "#") return await textures.getTexture("discordplaysminesweeper.base/border/empty");

    if (showExploded && cell.mined) return await cell.mine.getMineTexture(textures);
    if (!cell.visible) return await textures.raisedCell();
    if (cell.flagged) return await cell.flag.getFlagTexture(textures);
    if (cell.mined) return await cell.mine.getMineTexture(textures);
    if (cell.number == Number.MAX_SAFE_INTEGER) return await textures.loweredCell();

    if (cell.extra == "?") return await textures.getTexture("discordplaysminesweeper.base/question-mark/question-mark");
    if (cell.extra == "69") return await textures.getTexture("discordplaysminesweeper.base/cell/69");
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
