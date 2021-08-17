const Board = require('../../game/Board');

class FBoard extends Board {
  static id = "fboard";

  constructor(bot, boardId, guildId=null, channelId=null, userId=null, width, height, seed, texturepack) {
    super(bot, boardId, guildId, channelId, userId, 15, 15, seed, texturepack);
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
