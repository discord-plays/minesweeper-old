require('dotenv').config();
const path = require("path");
const fs = require("fs");
const Discord = require("discord.js");
const client = new Discord.Client();
const MinesweeperBot = require("./game/Minesweeper");
const myServer = require('./server');

const loadingconfig = require("./config.json");
const DEBUG = require('./debug');
const basedir = __dirname;
const datadir = path.join(__dirname, ".data");
const guildSettingsPath = path.join(datadir, 'GuildSettings');
const userSettingsPath = path.join(datadir, 'UserSettings');
const creditsPath = path.join(basedir, 'credits.txt');

const jsonfile = {
  ...loadingconfig,
  logoGame: loadingconfig.logoGame,
  logoQuestion: loadingconfig.logoQuestion
};

var config_maxboardx;
var config_maxboardy;
try {
  config_maxboardx = parseInt(process.env.MAXX);
} catch (err) {
  console.error(".env value MAXX is invalid");
  process.exit(1);
}
try {
  config_maxboardy = parseInt(process.env.MAXY);
} catch (err) {
  console.error(".env value MAXY is invalid");
  process.exit(1);
}
const maxBoardX = config_maxboardx;
const maxBoardY = config_maxboardy;

const options = {
  DEBUG,
  jsonfile,
  maxBoardX,
  maxBoardY,
  basedir,
  datadir,
  guildSettingsPath,
  userSettingsPath,
  creditsPath
};


// Make datadir and subfolders
if (!fs.existsSync(datadir)) fs.mkdirSync(datadir);
if (!fs.existsSync(guildSettingsPath)) fs.mkdirSync(guildSettingsPath);
if (!fs.existsSync(userSettingsPath)) fs.mkdirSync(userSettingsPath);

var bot = null;

client.on("ready", () => {
  console.log(`Discord Plays Minesweeper Bot ${jsonfile.version}`);
  console.log(`Do \`>credits\` to see the people who made this crazy bot`);
  bot = new MinesweeperBot(client, myServer, options);
  bot.start();

  myServer.sendMinesweeperBot(bot);
  myServer.sendBotData({tag:client.user.tag});
});

client.on("message", message => {
  if (bot == null) return;
  if (message.guild == null && bot.menuController.waitingForInput(message.author)) return bot.menuController.sendInput(message);
  if (message.mentions.has(client.user)) return bot.processPing(message, config);

  // Respond to messages for the server's prefix or the default if the server doesn't have settings or the text channel is in a DM
  var config = bot.getPerServerSettings(message.guild == null ? ("dm-" + message.author.id) : message.guild.id.toString());
  if (message.content.startsWith(config.prefix) && !message.content.startsWith(`${config.prefix} `)) return bot.processCommand(message, config);
});

client.on("messageReactionAdd",(reaction,user)=>{
  bot.menuController.addReaction(reaction,user);
});

client.on("messageReactionRemove",(reaction,user)=>{
  bot.menuController.removeReaction(reaction,user);
});

// login stuffs
client.login(process.env.DISCORD_TOKEN);
