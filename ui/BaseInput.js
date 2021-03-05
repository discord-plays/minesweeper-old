const { MessageEmbed } = require('discord.js');
const { BUTTON_MENU } = require('./EmojiButtons');

class BaseInput {
  constructor(menu) {
    this.controller = menu.controller;
    this.menu = menu;
    this.name = '';
    this.symbol = '';
    this.type = '';
    this.message = null;
    this.value = null;
    this.callback = null;
  }

  setCallback(callback) {
    this.callback = callback;
  }

  triggerCallback() {
    if(this.callback!=null) this.callback(this.value);
  }

  generateRichEmbed() {
    const embed = new MessageEmbed()
      .setTitle(`${this.menu.name} -> ${this.name}`)
      .setColor(this.color)
    
    embed.setDescription(this.description);
    this.editEmbed(embed);

    return embed;
  }

  editEmbed() {
    /* Can be overridden to edit the embed before sending called from `generateRichEmbed()` */
  }

  getWidgetOptionSymbols() {
    return [BUTTON_MENU.symbol,...this.options.map(x=>x.symbol)];
  }

  sendTo(textChannel) {
    var $t=this;
    textChannel.send(this.generateRichEmbed()).then(async m=>{
      $t.message = m;
      $t.menu.message = m;
      $t.controller.sent.push({message:m,input:$t,user:$t.menu.user,type:'reaction'});
      let o=$t.getWidgetOptionSymbols();
      try {
        for(let i=0;i<o.length;i++) {
          await m.react(o[i]);
        }
      } catch(e) {
        /* idk ignore this probably unknow message */
      }
    });
  }

  destroy() {
    this.message.delete().then(()=>{}).catch(()=>{});
    this.controller.destroyMenu(this);
  }

  addReaction(reaction) {
    if(reaction.emoji.name==BUTTON_MENU.symbol) {
      return this.menu.showMenu();
    }
    console.log('Base input received add reaction. Maybe this is an error?');
  }

  removeReaction(reaction) {
    console.log('Base input received remove reaction. Maybe this is an error?');
  }
}

module.exports = BaseInput;
