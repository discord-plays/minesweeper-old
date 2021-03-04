const {MessageEmbed} = require('discord.js');
const Textbox = require('./widgets/Textbox');
const ArrayInput = require('./widgets/ArrayInput');
const BooleanInput = require('./widgets/BooleanInput');
const FloatInput = require('./widgets/FloatInput');
const IntegerInput = require('./widgets/IntegerInput');
const StringInput = require('./widgets/StringInput');
const { BUTTON_NUMBERS } = require('./EmojiButtons');

class Menu {
  constructor(controller) {
    this.widgets = [];
    this.controller = controller;
    this.title = "";
    this.color = 0xff0000;
    this.description = "";
  }

  addWidget(widget) {
    this.widgets.push(widget);
    widget.symbol = BUTTON_NUMBERS[(this.widgets.length - 1) % BUTTON_NUMBERS.length].symbol;
    return widget;
  }

  addTextWidget() {
    return this.addWidget(new Textbox(this));
  }

  addArrayInputWidget() {
    return this.addWidget(new ArrayInput(this));
  }

  addBooleanInputWidget() {
    return this.addWidget(new BooleanInput(this));
  }

  addFloatInputWidget() {
    return this.addWidget(new FloatInput(this));
  }

  addIntegerInputWidget() {
    return this.addWidget(new IntegerInput(this));
  }

  addStringInputWidget() {
    return this.addWidget(new StringInput(this));
  }

  generateRichEmbed() {
    const embed = new MessageEmbed()
      .setTitle(this.title)
      .setColor(this.color)
    
    let o=[this.description];
    for(let i=0;i<this.widgets.length;i++) o.push(`(${this.widgets[i].symbol}) ${this.widgets[i].name}`);
    embed.setDescription(o.join('\n'));

    return embed;
  }

  getWidgetOptionSymbols() {
    return this.widgets.map(x=>x.symbol);
  }

  sendTo(textChannel) {
    return textChannel.send(this.generateRichEmbed());
  }

  destroy() {
    this.controller.destroyMenu(this);
  }
}

module.exports = Menu;