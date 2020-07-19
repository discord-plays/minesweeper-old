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
    var tp = bot.getAssets().find(this.texturepack);
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
        var letterIcon = textures.getBorder()
        var letterPosition = (1 + x) * 16;
        baseimg.composite(letterIcon, letterPosition, 0);
        baseimg.composite(letterIcon, letterPosition, borderBottomEdge);
      }
    } catch (err) {
      console.error("Issue creating new image in memory");
      console.error(err);
    }
    Jimp.read("minesweeper-icons.png").then(iconsimg => {
      t.iconsimg = iconsimg;
      var r = new Jimp(16 * (this.width + 2), 16 * (this.height + 2), (err, baseimg) => {
        if (err) throw err;
        this.board.forEach((row, y) => {
          row.forEach((icontype, x) => {
            baseimg.composite(t.getIcon(icontype), (1 + x) * 16, (1 + y) * 16);
          });
        });
        var cornerIcon = t.getIcon("corner");
        baseimg.composite(cornerIcon, 0, 0);
        baseimg.composite(cornerIcon, (this.width + 1) * 16, 0);
        baseimg.composite(cornerIcon, 0, (this.height + 1) * 16);
        baseimg.composite(cornerIcon, (this.width + 1) * 16, (this.height + 1) * 16);

        var sidebaseIcon = t.getIcon("sidebase");
        for (var x = 0; x < this.width; x++) {
          var a = letterVal(x).toLowerCase();
          var b = "a".charCodeAt(0);
          if (a.length == 1) {
            var letterIcon = t.getIcon("letter-" + a);
            // top letter
            baseimg.composite(letterIcon, (1 + x) * 16, 0);
            // bottom letter
            baseimg.composite(letterIcon, (1 + x) * 16, (this.height + 1) * 16);
          } else if (a.length == 2) {
            // top letter
            var sidebaseLeftIcon = t.getMiniIcon(a.charCodeAt(0) - b);
            var sidebaseRightIcon = t.getMiniIcon(a.charCodeAt(1) - b);
            baseimg.composite(sidebaseIcon, (1 + x) * 16, 0);
            baseimg.composite(sidebaseLeftIcon, (1 + x) * 16 + 2, 3);
            baseimg.composite(sidebaseRightIcon, (1 + x) * 16 + 9, 3);
            // bottom letter
            baseimg.composite(sidebaseIcon, (1 + x) * 16, (this.height + 1) * 16);
            baseimg.composite(sidebaseLeftIcon, (1 + x) * 16 + 2, (this.height + 1) * 16 + 3);
            baseimg.composite(sidebaseRightIcon, (1 + x) * 16 + 9, (this.height + 1) * 16 + 3);
          }
        }
        for (var y = 0; y < this.height; y++) {
          if (y < 9) {
            var numberIcon = t.getIcon("number-" + (y + 1));
            // left number
            baseimg.composite(numberIcon, 0, (1 + y) * 16);
            // right number
            baseimg.composite(numberIcon, (this.width + 1) * 16, (1 + y) * 16);
          } else {
            var sidebaseLeftNumber = t.getMiniIcon((Math.floor((y + 1) / 10) % 10) + 26);
            var sidebaseRightNumber = t.getMiniIcon(((y + 1) % 10) + 26);
            // left number
            baseimg.composite(t.getIcon("sidebase"), 0, (1 + y) * 16);
            baseimg.composite(sidebaseLeftNumber, 2, (1 + y) * 16 + 3);
            baseimg.composite(sidebaseRightNumber, 9, (1 + y) * 16 + 3);
            // right number
            baseimg.composite(t.getIcon("sidebase"), (this.width + 1) * 16, (1 + y) * 16);
            baseimg.composite(sidebaseLeftNumber, (this.width + 1) * 16 + 2, (1 + y) * 16 + 3);
            baseimg.composite(sidebaseRightNumber, (this.width + 1) * 16 + 9, (1 + y) * 16 + 3);
          }
        }
        baseimg.resize(this.width * 64, Jimp.AUTO, Jimp.RESIZE_NEAREST_NEIGHBOR).getBuffer(Jimp.MIME_PNG, (error, result) => {
          if (error) throw error;
          callback(result);
        });
      });
    });
  }

  getIcon(name) {
    var img = this.iconsimg;
    var i = minesweeperIconsMap.indexOf(name);
    return img.clone().crop((i % 10) * 16, Math.floor(i / 10) * 16, 16, 16);
  }
  getMiniIcon(i) {
    var img = this.iconsimg;
    return img.clone().crop((i % 13) * 6 + 5 * 16, Math.floor(i / 13) * 10 + 7 * 16, 6, 10);
  }
}

// https://stackoverflow.com/a/32007970/10719432
function letterVal(i) {
  return (i >= 26 ? letterVal(((i / 26) >> 0) - 1) : "") + "abcdefghijklmnopqrstuvwxyz" [i % 26 >> 0];
}

module.exports = MinesweeperBoard;