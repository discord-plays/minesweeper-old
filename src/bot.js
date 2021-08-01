const DEBUG = require('./debug');
const DEBUG_LOGGING = require('./debug_logging');
const CREDITS = require('./credits.json');
const { version } = require('../package.json');

const path = require("path");
const fs = require("fs");
const Discord = require("discord.js");
const client = new Discord.Client({
  intents: [ Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES, Discord.Intents.FLAGS.DIRECT_MESSAGES ],
  partials: [ 'MESSAGE', 'CHANNEL', 'REACTION' ]
});

const MinesweeperBot = require("./game/Minesweeper");
const myServer = require('./server');
const loadingconfig = require('./config.json');

const basedir = __dirname;
const datadir = path.join(__dirname, ".data");
const guildSettingsPath = path.join(datadir, 'GuildSettings');
const userSettingsPath = path.join(datadir, 'UserSettings');
const boardDataPath = path.join(datadir,'Boards');

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
const DISCORD_ID = process.env.DISCORD_ID;

const options = {
  DISCORD_ID,
  DEBUG,
  DEBUG_LOGGING,
  CREDITS,
  jsonfile,
  maxBoardX,
  maxBoardY,
  basedir,
  datadir,
  guildSettingsPath,
  userSettingsPath,
  boardDataPath
};

// Make datadir and subfolders
if (!fs.existsSync(datadir)) fs.mkdirSync(datadir);
if (!fs.existsSync(guildSettingsPath)) fs.mkdirSync(guildSettingsPath);
if (!fs.existsSync(userSettingsPath)) fs.mkdirSync(userSettingsPath);
if (!fs.existsSync(boardDataPath)) fs.mkdirSync(boardDataPath);

var bot = null;

client.on("ready", () => {
  console.log(`Discord Plays Minesweeper v${version}`);
  console.log(`Do \`>credits\` to see the people who made this crazy bot`);
  console.log(`Do \`>deploy guild\` to setup slash commands in the guild`);
  bot = new MinesweeperBot(client, myServer, options);
  bot.start();

  myServer.sendMinesweeperBot(bot);
  myServer.sendBotData({tag: client.user.tag});
});

client.on("messageCreate", message => {
  if (bot == null) return;
  if (message.guild == null && bot.menuController.waitingForInput(message.author)) return bot.menuController.sendInput(message);

  // Respond to messages for the server's prefix or the default if the server doesn't have settings or the text channel is in a DM
  let config = bot.getPerServerSettings(message.guild == null ? ("dm-" + message.author.id) : message.guild.id.toString());
  if (message.mentions.has(client.user)) return bot.processPing(message.channel, config);
  if (message.content.startsWith(config.prefix) && !message.content.startsWith(`${config.prefix} `)) return bot.processMessageCommand(message, config);
});

client.on("guildCreate", guild => {
  if (bot == null) return;
  let config = bot.getPerServerSettings(guild.id.toString());
  var embed = new Discord.MessageEmbed()
  .setColor("#292340")
  .setAuthor("Discord Plays Minesweeper", bot.jsonfile.logoQuestion)
  .setTitle("Welcome")
  .setDescription([
    "Thanks for inviting me to your server, here's how to get started.",
    `Run \`${config.prefix}start\` to create a new game`,
    `Run \`${config.prefix}help\` for more information`
  ].join('\n'));

  guild.channels.fetch().then(channels=>{
    channels = channels.filter(x=>x.isText());
    if(channels.size>0) {
      let goodChannelRegex = /.+(general).+/i;
      let outChannel = channels.first();
      for (const value of channels.values()) {
        if(goodChannelRegex.test(value.name)) {
          outChannel = value;
          break;
        }
      }
      outChannel.send({embeds:[embed]});
    }
  })
});

client.on("interactionCreate", interaction => {
  if(interaction.isButton()) {
    bot.menuController.clickButton(interaction, interaction.user);
  } else if(interaction.isCommand()) {
    let config = bot.getPerServerSettings(interaction.guild == null ? ("dm-" + interaction.user.id) : interaction.guild.id.toString());
    bot.processInteractionCommand(interaction, config);
  }
});

// login stuffs
client.login(process.env.DISCORD_TOKEN);
