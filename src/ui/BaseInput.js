const { MessageEmbed } = require('discord.js');
const { BUTTON_MENU } = require('./EmojiButtons');

const { MessageButton, MessageActionRow } = require('discord-buttons');
const MAX_ACTION_ROW_WIDTH = 5;

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
    this.options = [];
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

  generateOptionButtons() {
    var o=[];
    for(let i=0;i<this.options.length;i++) o.push(
      new MessageButton()
        .setLabel(this.options[i].name)
        .setStyle("grey")
        .setEmoji(this.options[i].symbol)
        .setID(`${this.menu.name.toLowerCase()}_${this.name.toLowerCase()}_button-${i}`)
    );
    return o;
  }

  sendTo(textChannel) {
    var $t=this;

    let opts = this.generateOptionButtons();
    if(opts.length > 18) {
      throw new Exception("idk what to do?");
    }

    opts.splice(0,0,new MessageButton().setLabel("Back").setStyle("blurple").setEmoji(BUTTON_MENU.symbol).setID(`${this.menu.name.toLowerCase()}_${this.name.toLowerCase()}_home`));

    let rows = [];
    let y = Math.ceil(opts.length / MAX_ACTION_ROW_WIDTH);
    for(let i=0;i<y;i++) {
      rows.push(new MessageActionRow());
    }

    for(let i=0;i<opts.length;i++) {
      rows[Math.floor(i/MAX_ACTION_ROW_WIDTH)].addComponent(opts[i]);
    }

    textChannel.send("",{embed:this.generateRichEmbed(),components:rows}).then(async m=>{
      $t.message = m;
      $t.menu.message = m;
      $t.controller.sent.push({message:m,input:$t,user:$t.menu.user,type:'message-button'});
    });
  }

  destroy() {
    this.message.delete().then(()=>{}).catch(()=>{});
    this.controller.destroyMenu(this);
  }

  clickButton(button) {
    if(button.id == `${this.menu.name.toLowerCase()}_${this.name.toLowerCase()}_home`) {
      button.defer();
      return this.menu.showMenu();
    }
    console.log(`Base input received click button. Maybe this is an error? (button id: ${button.id})`);
  }
}

module.exports = BaseInput;
