const { messageCommand, interactionCommand, help, example, options } = require('./start');

function playMessage(bot, msg, args = []) {
  if (args.length != 0 && args.length != 1 && args.length != 3) return bot.sendInvalidOptions("play", msg);
  messageCommand(bot, msg, args);
}

function playInteraction(bot, interaction) {
  interactionCommand(bot, interaction);
}

var helpExample = example.map(x=>x.replace('>start','>play'));
var helpText = help;
var playOptions = options;

module.exports = {
  messageCommand: playMessage,
  interactionCommand: playInteraction,
  help: helpText,
  example: helpExample,
  options: playOptions
};
