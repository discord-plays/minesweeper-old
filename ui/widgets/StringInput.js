const BaseInput = require("../BaseInput");
const { BUTTON_PENCIL } = require("../EmojiButtons");

class StringInput extends BaseInput {
  constructor(menu,name) {
    super(menu);
    this.name = name;
    this.description = "";
    this.type = 'StringInput';
    this.options = [BUTTON_PENCIL];
    this.acceptingInput = null;
  }

  editEmbed(embed) {
    let o=[this.description,`React with ${BUTTON_PENCIL.name} to input a new value`,`(${BUTTON_PENCIL.name}) ${this.value}`];
    embed.setDescription(o.join('\n'));
  }

  sendInput(text) {
    this.value = text;
    this.menu.changeWidget(this);
    this.triggerCallback();
  }

  addReaction(reaction) {
    let $t=this;
    if(reaction.message.id == this.message.id) {
      if(reaction.emoji.name == BUTTON_PENCIL.symbol) {
        $t.controller.sent.push({message:$t.message,input:$t,user:$t.menu.user,type:'string'});
        $t.message.channel.send('Input your text after the tone (***beep***):').then(x=>this.acceptingInput=x).catch(()=>{});
      } else {
        super.addReaction(reaction);
      }
    }
  }

  removeReaction(reaction) {
    if(reaction.message.id == this.message.id) {
      if(this.acceptingInput!=null)this.acceptingInput.delete().then(()=>{}).catch(()=>{});
      this.menu.changeWidget(this);
    }
  }
}

module.exports = StringInput;
