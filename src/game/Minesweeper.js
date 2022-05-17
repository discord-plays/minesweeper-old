const BotProject = require("discord-plays-base/src/game/BotProject");
const Assets = require("discord-plays-base/src/game/Assets");
const CommandsList = require("discord-plays-base/src/game/CommandsList");
const MissionsList = require("discord-plays-base/src/game/MissionsList");
const ModLoader = require("discord-plays-base/src/game/ModLoader");
const path = require("path");
const fs = require("fs");
const glob = require("glob");
const Discord = require("discord.js");
const Board = require("./Board");
const MenuController = require("../ui/Controller");
const randomarrayitem = require("../utils/randomarrayitem");
const DEBUG_LOGGING = require("../debug_logging");
const LoadedMinesweeperTexturepack = require("./LoadedMinesweeperTexturepack");

class MinesweeperBot extends BotProject {
  constructor(client, server, options) {
    super(client, server, options, LoadedMinesweeperTexturepack);

    this.__customboards = {};
    this.__mines = {};
    this.__flags = {};
  }

  getMines() {
    return Object.values(this.__mines).flatMap((x) => x);
  }

  getMinesLayered() {
    return this.__mines;
  }

  getFlags() {
    return Object.values(this.__flags).flatMap((x) => x);
  }

  getBoards() {
    return Object.values(this.__customboards).flatMap((x) => x);
  }

  getBoardsLayered() {
    return this.__customboards;
  }

  getFlagsLayered() {
    return this.__flags;
  }

  findMine(name) {
    let n = name.toLowerCase();
    let f = this.getMines().filter((x) => x.name.toLowerCase() == n);
    return f.length == 1 ? f[0] : null;
  }

  findFlag(name) {
    let n = name.toLowerCase();
    let f = this.getFlags().filter((x) => x.name.toLowerCase() == n);
    return f.length == 1 ? f[0] : null;
  }

  getMineById(id) {
    let f = this.getMines().filter((x) => x.id == id);
    return f.length == 1 ? f[0] : null;
  }

  getFlagById(id) {
    let f = this.getFlags().filter((x) => x.id == id);
    return f.length == 1 ? f[0] : null;
  }

  addMine(mod, mine) {
    if (!this.__mines.hasOwnProperty(mod.id)) this.__mines[mod.id] = [];
    if (!this.__flags.hasOwnProperty(mod.id)) this.__flags[mod.id] = [];
    mine.mod = mod;
    this.__mines[mod.id].push(mine);
    this.__flags[mod.id].push(mine);
  }

  addBoard(mod, board) {
    if (!this.__customboards.hasOwnProperty(mod.id)) this.__customboards[mod.id] = [];
    board.mod = mod;
    this.__customboards[mod.id].push(board);
  }

  startGame(channel, user, customBoardId, j, missionName, replyFunc = null) {
    // get the guild and channel ids
    let guildId, channelId;
    [guildId, channelId] = [channel.guild == undefined || channel.guild == null ? "dm" : channel.guild.id, channel.id];
    let boardId = `${guildId}-${guildId == "dm" ? user.id : channelId}`;

    if (this.isBoard(boardId)) throw new Error("Error: There is already a board running in this channel!");

    let xSize = parseInt(j.board.width);
    let ySize = parseInt(j.board.height);
    if (isNaN(xSize) || isNaN(ySize)) throw new Error("Error: Invalid board size!");

    if (xSize <= 2 || ySize <= 2) throw new Error("Error: Board too small! The width and height must be bigger than 2.");
    if (xSize > this.maxBoardX || ySize > this.maxBoardY) throw new Error(`Error: Board too big! The board can't be bigger than (${this.maxBoardX}, ${this.maxBoardY}).`);

    var k = Object.keys(j.mines);
    let m = [];
    for (var i = 0; i < k.length; i++) {
      if (isNaN(j.mines[k[i]])) throw new Error("Error: Invalid mine count!");
      m.push();
      j.mines[k[i]] = parseInt(j.mines[k[i]].toString().trim());
    }

    let startTime = new Date();
    let totalTime = j.board.timer == null || j.board.timer == undefined ? 0 : parseInt(j.board.timer);
    if (isNaN(totalTime)) totalTime = 0;

    // Change seed for tournament or something?
    let hasDefinedSeed = !(j.board.seed == null || j.board.seed == undefined);
    let seed = hasDefinedSeed ? parseInt(j.board.seed) : Math.floor(Math.random() * Math.pow(10, 15));

    var board = this.createBoard(customBoardId, boardId, guildId, channelId, user.id, xSize, ySize, seed, hasDefinedSeed, "%%default%%", startTime, totalTime, missionName);
    board.generate(j.mines);
    board.fillNumbers();
    board.save();
    if (replyFunc == null) replyFunc = { reply: (...x) => channel.send(...x) };
    board.displayBoard(replyFunc);
  }

  getMine(ref) {
    ref = ref.toString().toLowerCase();

    let f = this.getMines().filter((x) => x.getAlias().includes(ref));
    if (f.length == 1) return f[0];
    else if (f.length == 0) throw new Error(`Error: The mine \`${ref}\` doesn't exist`);
    else throw new Error("Error: Multiple mines share an alias");
  }

  getFlag(ref) {
    ref = ref.toString().toLowerCase();

    let f = this.getFlags().filter((x) => x.getAlias().includes(ref));
    if (f.length == 1) return f[0];
    else if (f.length == 0) throw new Error(`Error: The flag \`${ref}\` doesn't exist`);
    else throw new Error("Error: Multiple flags share an alias");
  }

  createBoard(customBoardId, id, guildId, channelId, userId, width, height, seed, hasDefinedSeed, texturepack, startTime = null, totalTime = 0, missionName = null) {
    if (this.isBoard(id)) return false;
    console.log("Creating board with seed: " + seed);

    var customBoard;
    if (customBoardId == "vanilla") customBoard = Board;
    else {
      let f = this.getBoards().filter((x) => x.id == customBoardId);
      if (f.length == 1) {
        customBoard = f[0];
      }
    }

    if (customBoard == undefined || customBoard == null) {
      throw new Error("Error: Failed to find board type");
    }

    if (startTime === null) startTime = new Date();
    this.__games[id] = new customBoard(this, id, guildId, channelId, userId, width, height, seed, hasDefinedSeed, texturepack, startTime, totalTime, missionName);
    this.updateStatus();
    return this.__games[id];
  }

  deleteBoard(id) {
    delete this.__games[id];
    this.updateStatus();
  }

  updateStatus(isReloading = false) {
    var $t = this;
    $t.client.user.setPresence({
      activities: [
        {
          name: $t.updateActivityVariables(isReloading ? $t.jsonfile.status.reloading : $t.jsonfile.status.activity),
          type: $t.jsonfile.status.presence.toUpperCase(),
        },
      ],
      status: isReloading ? "dnd" : "online",
    });
  }

  updateActivityVariables(act) {
    var $t = this;
    var active = $t.getRunningGames();
    act = act.replace("{{total-games}}", active);
    act = act.replace("{{label-games}}", active == 1 ? "game" : "games");
    act = act.replace("{{sad-emoji}}", active == 0 ? "😦" : "");
    return act;
  }

  // Start the Minesweeper handler
  start() {
    console.log("I think the bot is starting");
    this.updateStatus(true);

    let $t = this;
    this.timerCheckId = setInterval(function () {
      $t.timerChecker($t);
    }, this.jsonfile.timerCheckInterval);

    this.load().then((x) => {
      Promise.allSettled(x.map((y) => $t.loadASingleBoard($t, y))).then((results) => {
        results.forEach((result, num) => {
          if (result.status == "fulfilled") {
            console.log(`Reloaded the board: ${x[num]}`);
          } else if (result.status == "rejected") {
            console.error(`Failed to load the board ${x[num]} due to:`);
            console.error(result.reason);
          }
        });
        $t.updateStatus();
      });
    });
  }

  // Clean up this class
  end() {
    let $t = this;
    if ($t.timerCheckId != 0) clearInterval($t.timerCheckId);
  }

  // Provide the boards a constant update for time based events like a timer running out
  timerChecker() {
    let $t = this;
    for (const item in $t.__games) {
      $t.__games[item].timerCheck();
    }
  }

  async loadASingleGame($t, id) {
    if ($t.isGame(id)) throw new Error("Already a board running in this channel");
    console.log("Reloading board with id: " + id);
    $t.__games[id] = new Board($t, id);
    await $t.__games[id].load();
  }
}

module.exports = MinesweeperBot;
