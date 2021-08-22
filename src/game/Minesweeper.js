const path = require("path");
const fs = require("fs");
const glob = require("glob");
const Discord = require("discord.js");
const Assets = require('./Assets');
const CommandsList = require("./CommandsList");
const MissionsList = require("./MissionsList");
const Board = require('./Board');
const MenuController = require('../ui/Controller');
const ModLoader = require("./ModLoader");
const randomarrayitem = require("../utils/randomarrayitem");
const DEBUG_LOGGING = require('../debug_logging');

const TotalResources = 1;
const defaultGuildSettings = {
  prefix: '>'
};

class MinesweeperBot {
  constructor(client, server, options) {
    var $t = this;
    this.menuController = new MenuController();
    this.starttime = new Date();
    this.client = client;
    this.loadedresources = 0;
    this.loadedcommands = 0;
    this.loadedmissions = 0;
    this.web = server;
    this.timerCheckId = 0;

    // guildSettingsPath, userSettingsPath, maxBoardX, maxBoardY, jsonfile, datadir, basedir
    var k = Object.keys(options);
    for (var i = 0; i < k.length; i++) $t[k[i]] = options[k[i]];

    this.__assets = new Assets(this.basedir);
    let loadingAssets = this.__assets.load().then(() => {
      console.log("Loaded assets list");
      $t.loadedresources++;
    });
    this.__commandslist = new CommandsList(this.basedir);
    let loadingCommands = this.__commandslist.load().then(() => {
      console.log("Loaded commands list");
      $t.loadedcommands++;
    });
    this.__missionslist = new MissionsList(this.basedir);
    let loadingMissions = this.__missionslist.load().then(() => {
      console.log("Loaded missions list");
      $t.loadedmissions++;
    });

    this.__customboards = {};
    this.__boards = {};
    this.__mines = {};
    this.__flags = {};

    this.modLoader = new ModLoader(this,this.basedir);
    let loadingMods = this.modLoader.load().then(()=>{
      if (DEBUG_LOGGING) console.log(this.__mines);
    });

    Promise.all([loadingAssets, loadingCommands, loadingMissions, loadingMods]).then(x=>{
      $t.start();
    });
  }

  getModIds() {
    return this.modLoader.mods.map(x=>x.mod.id);
  }

  getMod(id) {
    let m = this.modLoader.get(id);
    return m != null ? m.mod : null;
  }

  getMines() {
    return Object.values(this.__mines).flatMap(x=>x);
  }

  getMinesLayered() {
    return this.__mines;
  }

  getFlags() {
    return Object.values(this.__flags).flatMap(x=>x);
  }

  getBoards() {
    return Object.values(this.__customboards).flatMap(x=>x);
  }

  getBoardsLayered() {
    return this.__customboards;
  }

  getFlagsLayered() {
    return this.__flags;
  }

  findMine(name) {
    let n = name.toLowerCase();
    let f = this.getMines().filter(x=>x.name.toLowerCase()==n);
    return f.length==1 ? f[0] : null;
  }

  findFlag(name) {
    let n = name.toLowerCase();
    let f = this.getFlags().filter(x=>x.name.toLowerCase()==n);
    return f.length==1 ? f[0] : null;
  }

  getMineById(id) {
    let f = this.getMines().filter(x=>x.id==id);
    return f.length==1 ? f[0] : null;
  }

  getFlagById(id) {
    let f = this.getFlags().filter(x=>x.id==id);
    return f.length==1 ? f[0] : null;
  }

  addMine(mod, mine) {
    if(!this.__mines.hasOwnProperty(mod.id)) this.__mines[mod.id] = [];
    if(!this.__flags.hasOwnProperty(mod.id)) this.__flags[mod.id] = [];
    mine.mod = mod;
    this.__mines[mod.id].push(mine);
    this.__flags[mod.id].push(mine);
  }

  addBoard(mod, board) {
    if(!this.__customboards.hasOwnProperty(mod.id)) this.__customboards[mod.id] = [];
    board.mod = mod;
    this.__customboards[mod.id].push(board);
  }

  startGame(channel, user, customBoardId, j, missionName, replyFunc=null) {
    // get the guild and channel ids
    let guildId, channelId;
    [guildId, channelId] = [(channel.guild == undefined || channel.guild == null) ? "dm" : channel.guild.id, channel.id];
    let boardId = `${guildId}-${guildId == "dm" ? user.id : channelId}`;

    if (this.isBoard(boardId)) throw new Error("Error: There is already a board running in this channel!");

    let xSize = parseInt(j.board.width);
    let ySize = parseInt(j.board.height);
    if (isNaN(xSize) || isNaN(ySize)) throw new Error("Error: Invalid board size!");

    if (xSize <= 2 || ySize <= 2)
      throw new Error("Error: Board too small! The width and height must be bigger than 2.");
    if (xSize > this.maxBoardX || ySize > this.maxBoardY)
      throw new Error(`Error: Board too big! The board can't be bigger than (${this.maxBoardX}, ${this.maxBoardY}).`);

    var k = Object.keys(j.mines);
    let m = [];
    for (var i = 0; i < k.length; i++) {
      if (isNaN(j.mines[k[i]])) throw new Error("Error: Invalid mine count!");
      m.push()
      j.mines[k[i]] = parseInt(j.mines[k[i]].toString().trim());
    }

    let startTime = new Date();
    let totalTime = (j.board.timer == null || j.board.timer == undefined) ? 0 : parseInt(j.board.timer);
    if(isNaN(totalTime)) totalTime = 0;

    // Change seed for tournament or something?
    let seed = (j.board.seed == null || j.board.seed == undefined) ? Math.floor(Math.random() * Math.pow(10,15)) : parseInt(j.board.seed);

    var board = this.createBoard(customBoardId, boardId, guildId, channelId, user.id, xSize, ySize, seed, "%%default%%", startTime, totalTime, missionName);
    board.generate(j.mines);
    board.fillNumbers();
    board.save();
    if(replyFunc == null) replyFunc = {reply:(...x)=>channel.send(...x)};
    board.displayBoard(replyFunc);
  }

  getMine(ref) {
    ref = ref.toString().toLowerCase();

    let f = this.getMines().filter(x=>x.getAlias().includes(ref));
    if(f.length == 1) return f[0];
    else if(f.length == 0) throw new Error(`Error: The mine \`${ref}\` doesn't exist`);
    else throw new Error("Error: Multiple mines share an alias");
  }

  getFlag(ref) {
    ref = ref.toString().toLowerCase();

    let f = this.getFlags().filter(x=>x.getAlias().includes(ref));
    if(f.length == 1) return f[0];
    else if(f.length == 0) throw new Error(`Error: The flag \`${ref}\` doesn't exist`);
    else throw new Error("Error: Multiple flags share an alias");
  }

  async getChannel(id) {
    return await this.client.channels.fetch(id);
  }

  async getDMChannel(id) {
    let user = await this.client.users.fetch(id);
    if(user == null) return null;
    let dm = await user.createDM();
    return dm;
  }

  getBoard(id) {
    if (this.isBoard(id)) return this.__boards[id];
    else return null;
  }

  isBoard(id) {
    return Object.keys(this.__boards).includes(id);
  }

  generateTip() {
    return randomarrayitem(this.TIPS).text;
  }

  createBoard(customBoardId, id, guildId, channelId, userId, width, height, seed, texturepack, startTime=null, totalTime=0, missionName=null) {
    if (this.isBoard(id)) return false;
    console.log("Creating board with seed: "+seed);

    var customBoard;
    if(customBoardId == "vanilla") customBoard = Board;
    else {
      let f=this.getBoards().filter(x=>x.id==customBoardId);
      if(f.length == 1) {
        customBoard = f[0];
      }
    }

    if(customBoard == undefined || customBoard == null) {
      throw new Error("Error: Failed to find board type");
    }

    if(startTime === null) startTime = new Date();
    this.__boards[id] = new customBoard(this, id, guildId, channelId, userId, width, height, seed, texturepack, startTime, totalTime, missionName);
    this.updateStatus();
    return this.__boards[id];
  }

  deleteBoard(id) {
    delete this.__boards[id];
    this.updateStatus();
  }

  updateStatus(isReloading=false) {
    var $t = this;
    $t.client.user.setPresence({
      activities: [
        {
          name: $t.updateActivityVariables(isReloading ? $t.jsonfile.status.reloading : $t.jsonfile.status.activity),
          type: $t.jsonfile.status.presence.toUpperCase()
        }
      ],
      status: (isReloading ? "dnd" : "online")
    });
  }

  updateActivityVariables(act) {
    var $t = this;
    var active = $t.getRunningGames();
    act = act.replace('{{total-games}}', active);
    act = act.replace('{{label-games}}', active == 1 ? "game" : "games");
    act = act.replace('{{sad-emoji}}', active == 0 ? "😦" : "");
    return act;
  }

  getRunningGames() {
    var $t = this;
    return Object.keys($t.__boards).length;
  }

  getAssets() {
    return this.__assets;
  }

  // Start the Minesweeper handler
  start() {
    console.log("I think the bot is starting");
    this.updateStatus(true);

    let $t = this;
    this.timerCheckId = setInterval(function() {
      $t.timerChecker($t);
    }, this.jsonfile.timerCheckInterval);

    this.load().then(x=>{
      Promise.allSettled(x.map(y=>$t.loadASingleBoard($t,y))).then(results=>{
        results.forEach((result, num)=>{
          if(result.status == "fulfilled") {
            console.log(`Reloaded the board: ${x[num]}`);
          } else if(result.status == "rejected") {
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
    let $t=this;
    if ($t.timerCheckId != 0) clearInterval($t.timerCheckId);
  }

  // Provide the boards a constant update for time based events like a timer running out
  timerChecker() {
    let $t=this;
    for (const item in $t.__boards) {
      $t.__boards[item].timerCheck();
    }
  }

  async loadASingleBoard($t,id) {
    if ($t.isBoard(id)) throw new Error("Already a board running in this channel");
    console.log("Reloading board with id: "+id);
    $t.__boards[id] = new Board($t, id);
    await $t.__boards[id].load();
  }

  load() {
    let $t=this;
    const regex = /^.*?(?<id>(?:dm|[0-9]+)-[0-9]+)\.json$/g;
    return new Promise((resolve, reject) => {
      glob(path.join($t.boardDataPath,'*.json'), (err, files) => {
        if (err) return reject();
        if (DEBUG_LOGGING) console.log(files);
        let f=[];
        for (var i = 0; i < files.length; i++) {
          let l = files[i].replace(regex,'$1');
          f.push(l === files[i] ? null : l);
        }
        resolve(f.filter(x=>x!==null));
      });
    });
  }

  sendInvalidOptions(command, msg) {
    var settings = this.getPerServerSettings(msg.guild == null ? "dm" : msg.guild.id);
    this.processReceivedError(new Error(`Error: Invalid options. Use \`${settings.prefix}help ${command}\` for help.`), msg);
  }

  sendMissingGame(replyFunc, guildId) {
    var settings = this.getPerServerSettings(guildId);
    this.processReceivedError(new Error(`Error: There is no game running in this channel. Learn how to start one in \`${settings.prefix}help\``), replyFunc);
  }

  getAllMissions() {
    return this.__missionslist.missions.map(x=>this.__missionslist.getMissionName(x));
  }

  findMission(missionName) {
    let cmd = this.__missionslist.find(missionName);
    if(cmd !== null) {
      var missionScript = require(cmd);
      return missionScript;
    }
    return null;
  }

  getAllCommands() {
    return this.__commandslist.commands.map(x=>this.__commandslist.getCommandName(x));
  }

  findCommand(primaryCommand) {
    let cmd = this.__commandslist.find(primaryCommand);
    if(cmd !== null) {
      var commandScript = require(cmd);
      return commandScript;
    }
    return null;
  }

  processMessageCommand(receivedMessage, config) {
    if (this.loadedresources != TotalResources) return receivedMessage.channel.send("Please wait while I finish loading my resources");
    var that = this;
    try {
      let fullCommand = receivedMessage.content.substr(config.prefix.length); // Remove the leading prefix characters
      let splitCommand = fullCommand.split(" "); // Split the message up in to pieces for each space
      let primaryCommand = splitCommand[0].toLowerCase(); // The first word directly after the exclamation is the command
      let args = splitCommand.slice(1); // All other words are arguments/parameters/options for the command
      let commandScript = that.findCommand(primaryCommand);
      if (commandScript != null) {
        if (commandScript.hasOwnProperty('messageCommand')) return commandScript.messageCommand(that, receivedMessage, args);
      } else throw new Error(`Error: Unknown command. Use \`${config.prefix}help\` for help.`);
    } catch (err) {
      // Process the error
      if(that.processReceivedError(err, receivedMessage)) {
        // Swap hadError flag
        let [guildId, channelId] = [receivedMessage.guild == null ? "dm" : receivedMessage.guild.id, receivedMessage.channel.id];
        let boardId = `${guildId}-${guildId == "dm" ? receivedMessage.author.id : channelId}`;
        if (that.isBoard(boardId)) that.getBoard(boardId).hadError = true;
      }
    }
  }

  processInteractionCommand(receivedInteraction, config) {
    if (this.loadedresources != TotalResources) return receivedMessage.channel.send("Please wait while I finish loading my resources");
    var that = this;
    try {
      let commandScript = that.findCommand(receivedInteraction.commandName);
      if (commandScript != null) {
        if(commandScript.hasOwnProperty('interactionCommand')) return commandScript.interactionCommand(that, receivedInteraction);
      } else throw new Error(`Error: Unknown command. Use \`${config.prefix}help\` for help or as an admin use \`${config.prefix}deploy\` to setup slash commands again.`);
    } catch (err) {
      // Process the error
      if(that.processReceivedError(err, receivedInteraction)) {
        // Swap hadError flag
        let [guildId, channelId] = [receivedInteraction.guild == null ? "dm" : receivedInteraction.guild.id, receivedInteraction.channel.id];
        let boardId = `${guildId}-${guildId == "dm" ? receivedInteraction.user.id : channelId}`;
        if (that.isBoard(boardId)) that.getBoard(boardId).hadError = true;
      }
    }
  }

  processReceivedError(err, replyFunc) {
    if (err.message !== "Failed: bomb exploded") {
      if (err.message.indexOf("Error: ") == 0) {
        replyFunc.reply({embeds:[
          new Discord.MessageEmbed()
          .setColor("#ba0c08")
          .setAuthor("Error:")
          .setTitle(err.message.slice(7, err.message.length))
        ]});
      } else {
        replyFunc.reply({embeds:[
          new Discord.MessageEmbed()
          .setColor("#ba0c08")
          .setAuthor("Oops!!")
          .setTitle("A fault occured :sob: Please inform my developer")
          .setDescription("Use the kill command to remove the current board so you can start a new game")
        ]});
        console.error("==================================");
        console.error("Fuck a fault occured");
        console.error("----------------------------------");
        console.error(err);
        console.error("==================================");
        return true;
      }
    }
    return false;
  }

  processPing(outChannel, config) {
    var embed = new Discord.MessageEmbed()
    .setColor("#292340")
    .setAuthor("Discord Plays Minesweeper", this.jsonfile.logoQuestion)
    .setTitle("Welcome")
    .setDescription([
      `Run \`${config.prefix}start\` to create a new game`,
      `Run \`${config.prefix}help\` for more information`
    ].join('\n'));
    outChannel.send({embeds:[embed]});
  }

  getPerServerSettings(guildId) {
    if (/^dm/.test(guildId.toString())) return defaultGuildSettings;
    var pathForGuildSettings = path.join(this.guildSettingsPath, guildId.toString().replace(/[^a-zA-Z0-9]/g, '') + '.json');
    if (fs.existsSync(pathForGuildSettings)) return {
      ...defaultGuildSettings,
      ...JSON.parse(fs.readFileSync(pathForGuildSettings))
    };
    else return {
      ...defaultGuildSettings
    };

  }

  setPerServerSettings(guildId, obj) {
    if (/^dm/.test(guildId.toString())) return new Promise((_resolve, reject) => {
      reject("DMs cannot save guild customization settings");
    });
    return new Promise((resolve, reject) => {
      var pathForGuildSettings = path.join(this.guildSettingsPath, guildId.toString().replace(/[^a-zA-Z0-9]/g, '') + '.json');
      fs.writeFile(pathForGuildSettings, JSON.stringify(obj), function (err) {
        if (err) reject("Failed to save guild customization settings");
        else resolve();
      });
    });
  }

  getPerUserSettings(userId) {
    var pathForUserSettings = path.join(this.userSettingsPath, userId.toString().replace(/[^a-zA-Z0-9]/g, '') + '.json');
    if (fs.existsSync(pathForUserSettings)) return {
      ...defaultUserSettings,
      ...require(pathForUserSettings)
    };
    else return {
      ...defaultUserSettings
    };
  }

  setPerUserSettings(userId, obj) {
    return new Promise((resolve, reject) => {
      var pathForUserSettings = path.join(this.userSettingsPath, userId.toString().replace(/[^a-zA-Z0-9]/g, '') + '.json');
      fs.writeFile(pathForUserSettings, JSON.stringify(obj), function (err) {
        if (err) reject("Failed to save user settings");
        else resolve();
      })
    })
  }
}

module.exports = MinesweeperBot;
