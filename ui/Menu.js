const {MessageEmbed} = require('discord.js');
const StringInput = require('./widgets/StringInput');
const ArrayInput = require('./widgets/ArrayInput');
//const BooleanInput = require('./widgets/BooleanInput');
//const FloatInput = require('./widgets/FloatInput');
//const IntegerInput = require('./widgets/IntegerInput');
const { BUTTON_NUMBERS } = require('./EmojiButtons.js');

class Menu {
  constructor(controller, user) {
    this.widgets = [];
    this.controller = controller;
    this.type = "menu";
    this.user = user;
    this.name = "";
    this.color = 0xff0000;
    this.description = "";
    this.message = null;
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
      .setTitle(this.name)
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
    var $t=this;
    textChannel.send(this.generateRichEmbed()).then(async m=>{
      $t.message = m;
      $t.controller.sent.push({message:m,input:$t,user:$t.user,type:'reaction'});
      let o=$t.getWidgetOptionSymbols();
      try {
        for(let i=0;i<o.length;i++) {
          await m.react(o[i]);
        }
      } catch(e) {
        /* idk ignore this probably unknown message */
      }
    });
  }

  changeWidget(widget) {
    if(this.widgets.includes(widget)) {
      if(this.message!=null) widget.sendTo(this.message.channel);
      this.delete();
    }
  }

  showMenu() {
    if(this.message!=null) this.sendTo(this.message.channel);
    this.delete();
  }

  delete(a=false) {
    this.controller.removeTriggersForMessage(this.message);
    if(this.message!=null) this.message.delete().then(()=>{
      if(a) this.message = null;
    }).catch(()=>{});
  }

  destroy() {
    this.delete(true);
    this.controller.destroyMenu(this);
  }

  addReaction(reaction) {
    let options = this.getWidgetOptionSymbols();
    let index = options.indexOf(reaction.emoji.name);
    if(index!=-1) this.changeWidget(this.widgets[index]);
  }

  removeReaction(reaction) {
    /* Maybe nothing needs to happen? */
  }
}

module.exports = Menu;
