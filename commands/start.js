const Board = require('../game/Board');
const LZString = require('../game/LZString');

function decompile_code(code) {
  var raw = LZString.decompressFromEncodedURIComponent(code);
  var data = {};
  try {
    data = JSON.parse(raw);
  } catch (err) {
    throw new Error("Error: invalid generator code");
  }
  var json = {
    m: {},
    ...data
  };
  return json;
}

function startCommand(bot, msg, args) {
  if (args.length != 1) throw new Error("Error: The options code is missing!");

  var code = args[0];
  code = code.replace(/^.start /, '');
  var json = decompile_code(code);

  // parse first two arguments as xSize and ySize
  [xSize, ySize] = [json.b.width, json.b.height].map(x => parseInt(x.toString().trim()));
  if (isNaN(xSize) || isNaN(ySize)) throw new Error("Error: Board width and height must be integers!");

  // get the guild and channel ids
  [guildId, channelId] = [msg.guild == null ? "dm" : msg.guild.id, msg.channel.id];
  boardId = guildId + "-" + channelId;

  if (bot.isBoard(boardId)) throw new Error("Error: There is already a board running in this channel!");

  if (xSize <= 0 || ySize <= 0) {
    throw new Error("Error: Board too small!");
  }
  if (xSize > bot.maxBoardX || ySize > bot.maxBoardY) {
    throw new Error("Error: Board too big!");
  }

  var k = Object.keys(json.m);
  for (var i = 0; i < k.length; i++) {
    if (isNaN(json.m[k[i]])) throw new Error("Error: Invalid mine count!");
    json.m[k[i]] = parseInt(json.m[k[i]].toString().trim());
  }

  var board = bot.createBoard(boardId, guildId, channelId, xSize, ySize, "default");
  board.generate(json.m);
  board.fillNumbers();
  board.displayBoard();
}

var helpExample = [
  "`>start <width> <height> <options code>`"
];

var helpText = [
  "Start a new board in the current channel"
];

module.exports = {
  command: startCommand,
  help: helpText,
  example: helpExample
};