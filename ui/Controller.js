const Menu = require('./Menu');

class Controller {
  constructor() {
    this.menus = [];
    this.sent = [];
  }

  createMenu(user) {
    this.destroyUserMenu(user);
    let menu = new Menu(this,user);
    this.menus.push(menu);
    return menu;
  }

  destroyMenu(menu) {
    for(let i=0;i<this.menus.length;i++) {
      if(this.menus[i]===menu) {
        this.menus.splice(i,1);
        menu.destroy();
        break;
      }
    }
  }

  destroyUserMenu(user) {
    for(let i=0;i<this.menus.length;i++) {
      if(this.menus[i].user.id===user.id) {
        this.destroyMenu(this.menus[i]);
        break;
      }
    }
  }

  removeTriggersForMessage(message) {
    let i=0;
    while(i<this.sent.length) {
      if(this.sent[i].message.id==message.id) this.sent.splice(i,1);
      else i++;
    }
  }

  waitingForInput(user) {
    for(let i=0;i<this.sent.length;i++) {
      if(this.sent[i].user.id==user.id && this.sent[i].type=='string') return true;
    }
    return false;
  }

  sendInput(message) {
    let user = message.author;
    for(let i=0;i<this.sent.length;i++) {
      if(this.sent[i].user.id==user.id && this.sent[i].type=='string') {
        this.sent[i].input.sendInput(message.content);
      }
    }
  }

  addReaction(reaction, user) {
    for(let i=0;i<this.sent.length;i++) {
      if(this.sent[i].type!='reaction') continue;
      if(this.sent[i].user.id==user.id && this.sent[i].input.getWidgetOptionSymbols().includes(reaction.emoji.name)) {
        this.sent[i].input.addReaction(reaction);
      }
    }
  }

  removeReaction(reaction, user) {
    for(let i=0;i<this.sent.length;i++) {
      if(this.sent[i].type!='reaction') continue;
      if(this.sent[i].user.id==user.id && this.sent[i].input.getWidgetOptionSymbols().includes(reaction.emoji.name)) {
        this.sent[i].input.removeReaction(reaction);
      }
    }
  }
}

module.exports = Controller;
