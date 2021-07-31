const { messageCommand, interactionCommand } = require('./start');

function playMessage(bot, msg, args = []) {
  if (args.length > 0) return bot.sendInvalidOptions("play", msg);
  messageCommand(bot, msg, args);
}

function playInteraction(bot, interaction) {
  interactionCommand(bot, interaction);
}

var helpExample = [
  "`>play`"
];

var helpText = [
  "Attempts to start a new board in the current channel"
];

module.exports = {
  messageCommand: playMessage,
  interactionCommand: playInteraction,
  help: helpText,
  example: helpExample
};
