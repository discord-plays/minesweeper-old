const { MessageButton } = require("discord-buttons");
const BaseInput = require("../BaseInput");
const { BUTTON_PENCIL } = require("../EmojiButtons");

class StringInput extends BaseInput {
  constructor(menu,name) {
    super(menu);
    this.name = name;
    this.description = "";
    this.type = 'StringInput';
    this.options = [];
    this.acceptingInput = null;
    this.value = "";
  }

  editEmbed(embed) {
    let o=[this.description,`Press the edit button to input a new value`,`(${BUTTON_PENCIL.name}) ${this.value}`];
    embed.setDescription(o.join('\n'));
  }

  sendInput(text) {
    this.value = text;
    this.menu.changeWidget(this);
    this.triggerCallback();
  }

  generateOptionButtons() {
    return [new MessageButton()
      .setLabel("Edit")
      .setStyle("green")
      .setEmoji("📝")
      .setID(`${this.menu.name.toLowerCase()}_${this.name.toLowerCase()}_pencil`)
    ];
  }

  clickButton(button) {
    let $t = this;
    if(button.id == `${this.menu.name.toLowerCase()}_${this.name.toLowerCase()}_pencil`) {
      button.defer();
      $t.controller.sent.push({message:$t.message,input:$t,user:$t.menu.user,type:'string'});

      let undoButton = new MessageButton()
        .setLabel("Cancel")
        .setStyle("red")
        .setEmoji("❎")
        .setID(`${this.menu.name.toLowerCase()}_${this.name.toLowerCase()}_pencil_cancel`);
      $t.message.channel.send('Input your text after the tone (***beep***):',{component:undoButton}).then(x=>{
        this.acceptingInput=x;
        $t.controller.sent.push({message:x,input:$t,user:$t.menu.user,type:'message-button'});
      }).catch(()=>{});
      return;
    } else if(button.id == `${this.menu.name.toLowerCase()}_${this.name.toLowerCase()}_pencil_cancel`) {
      button.defer();
      if(this.acceptingInput!=null)this.acceptingInput.delete().then(()=>{}).catch(()=>{});
      this.menu.changeWidget(this);
      return;
    }
    super.clickButton(button);
  }
}

module.exports = StringInput;
