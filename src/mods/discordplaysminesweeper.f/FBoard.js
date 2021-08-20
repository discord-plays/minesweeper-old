const Board = require('../../game/Board');

class FBoard extends Board {
  static id = "fboard";
  static hideSizeOptions = true;

  // Do I really have to write out the whole constructor
  constructor(...args) {
    // Hacky way to override the width and height?
    if(args.length >= 7) {
      args[5] = 15;
      args[6] = 15;
    }
    super(...args);
    this.customBoardId = FBoard.id;
  }

  generate(totalMineCounts) {
    super.generate(totalMineCounts);
    let $t=this;
    for (var i = 0; i < $t.width; i++)
      for (var j = 0; j < $t.height; j++) {
        if(this.isInvalidCell(i,j)) {
          let c=$t.get(i,j);
          c.number = 0;
          c.extra = "#";
          c.visible = true;
        }
      }
  }

  isInvalidCell(x,y) {
    if(y>=15)
      return true;
    else if(y>=3) {
      if(y>=6 && y<=8) {
        if(x>=9) return true;
      } else if(x>=3)
        return true;
    }
    return false;
  }
}

module.exports = FBoard;
