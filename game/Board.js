const Jimp = require("jimp");
const ndarray = require("ndarray");

class MinesweeperBoard {
  constructor(bot, width, height, texturepack) {
    this.board = ndarray([], [width, height]);
    this.width = width;
    this.height = height;
    this.texturepack = texturepack;
    for (var i = 0; i < this.width; i++)
      for (var j = 0; j < this.height; j++)
        this.board.set(i, j, new Cell(this));
  }

  async render() {
    var t = this;
    var tp = t.bot.getAssets().find(this.texturepack);
    if (tp == null) return "invalid texturepack";
    var textures = await tp.use();
    try {
      var board = await new Jimp(16 * (this.width + 2), 16 * (this.height + 2));
      var borderRightEdge = (this.width + 1) * 16;
      var borderBottomEdge = (this.height + 1) * 16;

      // Border corners
      var cornerIcon = t.getBorderCorner();
      baseimg.composite(cornerIcon, 0, 0);
      baseimg.composite(cornerIcon, borderRightEdge, 0);
      baseimg.composite(cornerIcon, 0, borderBottomEdge);
      baseimg.composite(cornerIcon, borderRightEdge, borderBottomEdge);

      // Border letters
      for (var x = 0; x < this.width; x++) {
        var letterIcon = textures.getBorder(letterVal(x));
        var letterPosition = (1 + x) * 16;
        baseimg.composite(letterIcon, letterPosition, 0);
        baseimg.composite(letterIcon, letterPosition, borderBottomEdge);
      }
      for (var y = 0; y < this.height; y++) {
        var numberIcon = textures.getBorder(y);
        var numberPosition = (1 + y) * 16;
        baseimg.composite(numberIcon, 0, numberPosition);
        baseimg.composite(numberIcon, borderRightEdge, numberPosition);
      }

      t.board.forEach((row, y) => {
        row.forEach((cell, x) => {
          // Pls update as debug is not bombs or numbers xD
          baseimg.composite(t.getDebug(), (1 + x) * 16, (1 + y) * 16);
        })
      })

      return await baseimg.resize(this.width * 16, Jimp.AUTO, Jimp.RESIZE_NEAREST_NEIGHBOR).getBufferAsync(Jimp.MIME_PNG);
    } catch (err) {
      console.error("Issue creating new image in memory");
      console.error(err);
      return null;
    }
  }
}
/**
 * Thx stackoverflow
 * You are the best
 * https://stackoverflow.com/a/32007970/10719432
 */
function letterVal(i) {
  return (i >= 26 ? letterVal(((i / 26) >> 0) - 1) : "") + "abcdefghijklmnopqrstuvwxyz" [i % 26 >> 0];
}

module.exports = MinesweeperBoard;