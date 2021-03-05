const BaseInput = require("../BaseInput");
const { BUTTON_O } = require("../EmojiButtons");

class ArrayInput extends BaseInput {
  constructor(menu,name) {
    super(menu);
    this.name = name;
    this.description = "Pick a value by reacting with the required symbol";
    this.type = 'ArrayInput';
    this.options = [];
  }

  editEmbed(embed) {
    let o=[this.description];
    for(let i=0;i<this.options.length;i++) o.push(`(${this.options[i].symbol}) ${this.value==i?'**':''}${this.options[i].name}${this.value==i?'** '+BUTTON_O.name:''}`);
    embed.setDescription(o.join('\n'));
  }

  getRawOptions() {
    return this.options.map(x=>x.symbol);
  }

  addOption(name,symbol) {
    this.options.push({name,symbol});
  }

  addReaction(reaction) {
    if(reaction.message.id == this.message.id) {
      let v = this.getRawOptions().indexOf(reaction.emoji.name);
      if(v!=-1) {
        this.value = v;
        this.menu.changeWidget(this);
        this.triggerCallback();
      } else {
        super.addReaction(reaction);
      }
    }
  }

  removeReaction(reaction) {
    /* Well nothing needs to happen here */
  }
}

module.exports = ArrayInput;
