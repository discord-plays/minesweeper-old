const path = require("path");
const fs = require("fs");
const Discord = require("discord.js");
const Assets = require('./Assets');
const CommandsList = require("./CommandsList");
const Board = require('./Board');
const MenuController = require('../ui/Controller');
const TotalResources = 2;
const defaultGuildSettings = {
  prefix: '>'
}

class MinesweeperBot {
  constructor(client, server, options) {
    var $t = this;
    this.menuController = new MenuController();
    this.starttime = new Date();
    this.client = client;
    this.loadedresources = 0;
    this.web = server;

    // guildSettingsPath, userSettingsPath, maxBoardX, maxBoardY, jsonfile, datadir, basedir
    var k = Object.keys(options);
    for (var i = 0; i < k.length; i++) $t[k[i]] = options[k[i]];

    this.__assets = new Assets(this.basedir);
    this.__assets.load().then(() => {
      console.log("Loaded assets list");
      $t.loadedresources++;
    });
    this.__commandslist = new CommandsList(this.basedir);
    this.__commandslist.load().then(() => {
      console.log("Loaded commands list");
      $t.loadedresources++;
    });
    this.__boards = {};
    this.__mines = [...$t.getDefaultMines()];
    this.__flags = [...$t.getDefaultFlags()];
  }

  startGame(channel, j) {
    // get the guild and channel ids
    let guildId, channelId;
    [guildId, channelId] = [(channel.guild==undefined||channel.guild==null) ? "dm" : channel.guild.id, channel.id];
    let boardId = guildId + "-" + channelId;

    if (this.isBoard(boardId)) throw new Error("Error: There is already a board running in this channel!");

    let xSize = parseInt(j.board.width);
    let ySize = parseInt(j.board.height);
    if(isNaN(xSize)||isNaN(ySize)) throw new Error("Error: Invalid board size!");

    if (xSize <= 0 || ySize <= 0) {
      throw new Error("Error: Board too small!");
    }
    if (xSize > this.maxBoardX || ySize > this.maxBoardY) {
      throw new Error("Error: Board too big!");
    }

    var k = Object.keys(j.mines);
    for (var i = 0; i < k.length; i++) {
      if (isNaN(j.mines[k[i]])) throw new Error("Error: Invalid mine count!");
      j.mines[k[i]] = parseInt(j.mines[k[i]].toString().trim());
    }

    // Change seed for tournament or something?
    let seed = Math.floor(Math.random()*Math.pow(10,15));

    var board = this.createBoard(boardId, guildId, channelId, xSize, ySize, seed, "default");
    board.generate(j.mines);
    board.fillNumbers();
    board.save();
    board.displayBoard();
  }

  getDefaultMines() {
    return [{
        id: 0,
        names: ["none", "empty"]
      }, {
        id: 1,
        names: ["single"]
      },
      {
        id: 2,
        names: ["double"]
      },
      {
        id: 3,
        names: ["triple"]
      },
      {
        id: 4,
        names: ["Quadruple"]
      },
      {
        id: 5,
        names: ["Quintuple"]
      },
      {
        id: 6,
        names: ["Sextuple"]
      },
      {
        id: 7,
        names: ["Septuple"]
      },
      {
        id: 8,
        names: ["Octuple"]
      },
      {
        id: 9,
        names: ["Nonuple"]
      },
      {
        id: 10,
        names: ["Decuple"]
      }
    ];
  }

  getDefaultFlags() {
    return [{
        id: 0,
        names: ["none", "empty"]
      }, {
        id: 1,
        names: ["single"]
      },
      {
        id: 2,
        names: ["double"]
      },
      {
        id: 3,
        names: ["triple"]
      },
      {
        id: 4,
        names: ["Quadruple"]
      }, {
        id: 5,
        names: ["Quintuple"]
      }, {
        id: 6,
        names: ["Sextuple"]
      }, {
        id: 7,
        names: ["Septuple"]
      }, {
        id: 8,
        names: ["Octuple"]
      }, {
        id: 9,
        names: ["Nonuple"]
      }, {
        id: 10,
        names: ["Decuple"]
      }
    ]
  }

  getMine(ref) {
    var $t = this;
    ref = ref.toString().toLowerCase();
    if (/^[0-9]+$/.test(ref)) {
      var f = this.__mines.filter(x => x.id.toString() == ref);
      if (f.length == 1) return f[0];
      else if (f.length == 0) throw new Error(`Error: The mine \`${ref}\` doesn't exist`);
      else throw new Error("Error: Multiple mines share the same ID");
    } else {
      var f = this.__mines.filter(x => x.names.includes(ref));
      if (f.length == 1) return f[0];
      else if (f.length == 0) throw new Error(`Error: The mine \`${ref}\` doesn't exist`);
      else throw new Error("Error: Multiple mines share the same name or short name");
    }
  }

  getFlag(ref) {
    var $t = this;
    ref = ref.toString().toLowerCase();
    if (/^[0-9]+$/.test(ref)) {
      var f = this.__mines.filter(x => x.id.toString() == ref);
      if (f.length == 1) return f[0];
      else if (f.length == 0) throw new Error(`Error: The flag \`${ref}\` doesn't exist`);
      else throw new Error("Error: Multiple flag share the same ID");
    } else {
      var f = this.__mines.filter(x => x.names.includes(ref));
      if (f.length == 1) return f[0];
      else if (f.length == 0) throw new Error(`Error: The flag \`${ref}\` doesn't exist`);
      else throw new Error("Error: Multiple flag share the same name or short name");
    }
  }

  async getChannel(id) {
    return await this.client.channels.fetch(id);
  }

  getBoard(id) {
    if (this.isBoard(id)) return this.__boards[id];
    else return null;
  }

  isBoard(id) {
    return Object.keys(this.__boards).includes(id);
  }

  createBoard(id, guildId, channelId, width, height, seed, texturepack) {
    if (this.isBoard(id)) return false;
    this.__boards[id] = new Board(this, id, guildId, channelId, width, height, seed, texturepack);
    this.updateStatus();
    return this.__boards[id];
  }

  deleteBoard(id) {
    delete this.__boards[id];
    this.updateStatus();
  }

  updateStatus() {
    var $t = this;
    $t.client.user.setStatus("online");
    $t.client.user.setActivity($t.updateActivityVariables($t.jsonfile.status.activity), {
      type: $t.jsonfile.status.presence.toUpperCase()
    });
  }

  updateActivityVariables(act) {
    var $t = this;
    var active = $t.getRunningGames();
    act = act.replace('{{total-games}}', active);
    act = act.replace('{{label-games}}', active == 1 ? "game" : "games");
    return act;
  }

  getRunningGames() {
    var $t = this;
    return Object.keys($t.__boards).length;
  }

  getAssets() {
    return this.__assets;
  }

  start() {
    console.log("I think the bot is starting");
    this.updateStatus();
  }

  sendInvalidOptions(command, msg) {
    var settings = this.getPerServerSettings(msg.guild == null ? "dm" : msg.guild.id);
    throw new Error(`Error: Invalid options. Use \`${settings.prefix}help ${command}\` for help.`);
  }

  sendMissingGame(msg) {
    var settings = this.getPerServerSettings(msg.guild == null ? "dm" : msg.guild.id);
    throw new Error(`Error: There is no game running in this channel. Learn how to start one in \`${settings.prefix}help\``);
  }

  findCommand(primaryCommand) {
    try {
      var pathForCommandFile = path.join(this.basedir, 'commands', primaryCommand.replace(/[^a-zA-Z0-9]/g, '') + '.js');
      if (fs.existsSync(pathForCommandFile)) {
        var commandScript = require(pathForCommandFile);
        return commandScript;
      }
    } catch (err) {
      console.error("Error finding command file");
      console.error(err);
    }
    return null;
  }

  processCommand(receivedMessage, config) {
    if (this.loadedresources != TotalResources) return receivedMessage.channel.send("Please wait while I finish loading my resources");
    var that = this;
    try {
      let fullCommand = receivedMessage.content.substr(config.prefix.length); // Remove the leading exclamation mark
      let splitCommand = fullCommand.split(" "); // Split the message up in to pieces for each space
      let primaryCommand = splitCommand[0].toLowerCase(); // The first word directly after the exclamation is the command
      let args = splitCommand.slice(1); // All other words are arguments/parameters/options for the command
      let commandScript = that.findCommand(primaryCommand);
      if (commandScript != null) {
        if (commandScript.hasOwnProperty('command')) return commandScript.command(that, receivedMessage, args);
      } else throw new Error(`Error: Unknown command. Use \`${config.prefix}help\` for help.`);
    } catch (err) {
      if (err.message !== "Failed: bomb exploded") {
        if (err.message.indexOf("Error: ") == 0) {
          receivedMessage.channel.send(
            new Discord.MessageEmbed()
            .setColor("#ff0000")
            .setAuthor("Uh Oh...")
            .setTitle(err.message.slice(7, err.message.length))
          );
        } else {
          receivedMessage.channel.send(
            new Discord.MessageEmbed()
            .setColor("#ba0c08")
            .setAuthor("FUCK!!")
            .setTitle("A fault occured :sob: Please inform my developer")
          );
          console.error(err);
        }
      }
    }
  }

  processPing(receivedMessage, config) {
    var embed = new Discord.MessageEmbed()
    .setColor("#292340")
    .setAuthor("Minesweeper!", this.jsonfile.logoQuestion)
    .setTitle("Welcome")
    .setDescription([
      `Run \`${config.prefix}start\` to create a new game`,
      `Run \`${config.prefix}help\` for more information`
    ].join('\n'));
    receivedMessage.channel.send(embed);
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
