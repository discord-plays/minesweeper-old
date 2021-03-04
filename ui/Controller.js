const Menu = require('./Menu');

class Controller {
  constructor() {
    this.menus = [];
  }

  createMenu() {
    let menu = new Menu(this);
    this.menus.push(menu);
    return menu;
  }

  destroyMenu(menu) {
    for(let i=0;i<this.menus.length;i++) {
      if(this.menu[i]===menu) {
        this.menu.splice(i,1);
        break;
      }
    }
  }
}

module.exports = Controller;