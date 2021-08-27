function tripCommand(bot, msg, args = []) {
  if (!bot.DEBUG) return;
  if (args.length > 0) return bot.sendInvalidOptions("trip", msg);
  throw Error("fake error");
}

var helpExample = [
  "`>trip`"
];
var helpText = [
  "Debug command to throw a fake error"
];

module.exports = {
  messageCommand: tripCommand,
  debugOnly: true,
  help: helpText,
  example: helpExample
};
