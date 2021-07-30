const startCommand = require('./start').command;

function playCommand(bot, msg, args) {
  startCommand(bot, msg, args);
}

var helpExample = [
  "`>play`"
];

var helpText = [
  "Attempts to start a new board in the current channel"
];

module.exports = {
  command: playCommand,
  help: helpText,
  example: helpExample
};
