const Jimp = require('jimp');
const path = require('path');
const xor = require('../utils/xor');

class LoadedTexturepack {
  constructor(basedir, texturepath) {
    this.basedir = basedir;
    this.texturepath = texturepath == "%%default%%" ? "mods/$$/assets" : texturepath;
    this.cached = {};
    this.palette = {width: 16, height: 3};
  }

  /**
   * Get a texture by its asset id
   * @param {integer} index 
   * @returns Jimp image
   */
  async getTexture(a) {
    if(this.cached.hasOwnProperty(a)) return this.cached[a];
    let b = path.join(this.basedir,this.texturepath.replace('$$',a.split('/')[0]),`${a}.png`);
    try {
      this.cached[a] = await Jimp.read(b);
    } catch(err) {
      this.cached[a] = await this.getDebugPinkBlack();
    }
    return this.cached[a];
  }

  /**
   * 0 starts at the end of the first row so shift by one less than the width to turn (-this.palette.width) to 0 for the top left corner
   * @param {integer} index 
   * @returns Jimp image
   */
  async getPaletteColor(index) {
    var size = this.palette.width * this.palette.height;
    var lower = Math.abs(Math.floor(index / size));
    return await this.indexIntoPalette((index + (this.palette.width - 1) + lower * size) % size);
  }

  /**
   * Get the color in the palette at the specified index
   * @param {integer} index 
   * @returns Jimp image
   */
  async indexIntoPalette(index) {
    var pos = [((index % this.palette.width)), Math.floor(index / this.palette.width)];
    let tex = await this.getTexture("discordplaysminesweeper.base/palette");
    return tex.clone().crop(pos[0],pos[1],1,1);
  }

  /**
   * Get pink and black debug cell
   * @returns Jimp image
   */
  async getDebugPinkBlack() {
    return await this.getTexture('discordplaysminesweeper.base/debug/debug');
  }

  /**
   * Get pink and white debug cell
   * @returns Jimp image
   */
  async getDebugPinkWhite() {
    return await this.getTexture('discordplaysminesweeper.base/debug/debug2');
  }

  async getNumberWithPaletteColor() {
    return await this.getDebugPinkBlack();
  }

  /**
   * Get lowered cell
   * @returns Jimp image
   */
  async loweredCell() {
    return await this.getTexture('discordplaysminesweeper.base/cell/lowered');
  }

  /**
   * Get raised cell
   * @returns Jimp image
   */
  async raisedCell() {
    return await this.getTexture('discordplaysminesweeper.base/cell/raised');
  }

  /**
   * Get red exclamation mark cell
   * @returns Jimp image
   */
  async getRedExclamationMark() {
    return await this.getTexture('discordplaysminesweeper.base/exclamation-mark/exclamation-mark-red');
  }

  /**
   * Get border letter
   * @param {string} n 
   * @returns Jimp image
   */
  async getBorderLetter(n) {
    n = n.toLowerCase();
    if("abcdefghijklmnopqrstuvwxyz".includes(n)) return await this.getTexture('discordplaysminesweeper.base/border/letter/'+n);
    return null;
  }

  /**
   * Get border number
   * @param {integer} n 
   * @returns Jimp image
   */
  async getBorderNumber(n) {
    if(n >= 1 && n < 10) return await this.getTexture('discordplaysminesweeper.base/border/number/'+n);
    return null;
  }

  /**
   * Get mini border letter
   * @param {string} n 
   * @returns Jimp image
   */
  async getMiniBorderLetter(n) {
    n = n.toLowerCase();
    if("abcdefghijklmnopqrstuvwxyz".includes(n)) return await this.getTexture('discordplaysminesweeper.base/border/small-letter/'+n);
    return null;
  }

  /**
   * Get mini border number
   * @param {integer} n 
   * @returns Jimp image
   */
  async getMiniBorderNumber(n) {
    if(n >= 0 && n < 10) return await this.getTexture('discordplaysminesweeper.base/border/small-number/'+n);
    return null;
  }

  /**
   * Get border double letter
   * @param {string} a 
   * @param {string} b 
   * @returns Jimp image
   */
  async getBorderDoubleLetter(a, b) {
    var doublebase = await this.getTexture('discordplaysminesweeper.base/border/double-base');
    var let1 = await this.getMiniBorderLetter(a);
    var let2 = await this.getMiniBorderLetter(b);
    if (let1 == null || let2 == null) {
      console.error(`Error getting letter ${a} or ${b}`);
      return null;
    }
    doublebase.composite(let1, 2, 3);
    doublebase.composite(let2, 9, 3);
    return doublebase;
  }

  /**
   * Get border double number
   * @param {integer} a 
   * @param {integer} b 
   * @returns Jimp image
   */
  async getBorderDoubleNumber(a, b) {
    var doublebase = await this.getTexture('discordplaysminesweeper.base/border/double-base');
    var num1 = await this.getMiniBorderNumber(a);
    var num2 = await this.getMiniBorderNumber(b);
    if (num1 == null || num2 == null) {
      console.error(`Error getting number ${a} or ${b}`);
      return null;
    }
    doublebase.composite(num1, 2, 3);
    doublebase.composite(num2, 9, 3);
    return doublebase;
  }

  /**
   * Get border icon
   * @param {string} s - The name of the icon to display in the border
   * @returns Jimp image
   */
  async getBorderIcon(s) {
    var icon = await this.getBorderIconMiddle(s);
    if (icon == null) return null;
    var backing = await this.getTexture('discordplaysminesweeper.base/border/symbol-base');
    backing.composite(icon, 5, icon.bitmap.height == 5 ? 6 : 3);
    return backing;
  }

  /**
   * Get border icon middle
   * @param {string} s - The name of the icon to get
   * @returns Jimp image
   */
  async getBorderIconMiddle(s) {
    return await this.getTexture('discordplaysminesweeper.base/border/small-symbol/'+s);
  }

  /**
   * A wrapper for getting a border with single or double letters or numbers
   * @param {string/integer} n - The name or number of the icon
   * @returns Jimp image
   */
  async getBorder(n) {
    var s = n.toString().toLowerCase();
    if (![1, 2].includes(s.length)) {
      return await this.getBorderIcon(s);
    }
    var isLetter = "abcdefghijklmnopqrstuvwxyz".includes(s[0]);
    switch (s.length) {
      case 1:
        return isLetter ? await this.getBorderLetter(s[0]) : await this.getBorderNumber(n % 10);
      case 2:
        return isLetter ? await this.getBorderDoubleLetter(s[0], s[1]) : await this.getBorderDoubleNumber(Math.floor(n / 10), n % 10);
      default:
        return null;
    }
  }

  /**
   * Get border corner
   * @returns Jimp image
   */
  async getBorderCorner() {
    return await this.getTexture('discordplaysminesweeper.base/border/corner');
  }

  /**
   * Get raised extra cell
   * @param {string} s - The icon to display
   * @returns Jimp image
   */
  async getRaisedExtraCell(s) {
    if(!["melon","banana","question-mark","exclamation-mark"].includes(s)) return null;
    return await this.getTexture('discordplaysminesweeper.base/'+s+'/'+s+'-raised');
  }

  /**
   * Get lowered extra cell
   * @param {string} s - The icon to display
   * @returns Jimp image
   */
  async getLoweredExtraCell(s) {
    if(!["melon","banana","question-mark","exclamation-mark"].includes(s)) return null;
    return await this.getTexture('discordplaysminesweeper.base/'+s+'/'+s);
  }


  /**
   * =======================================================
   * =======================================================
   * After this is just the code for generating number cells
   * =======================================================
   * =======================================================
   */

  async getNumberWithPaletteColor(n, ...a) {
    var img = await this.getNumber(n, ...a);
    if (img == null) return img;
    var paletteColor = (await this.getPaletteColor(Math.floor(n))).bitmap.data;
    img.scan(0, 0, img.bitmap.width, img.bitmap.height, function (_x, _y, idx) {
      var red = img.bitmap.data[idx];
      var green = img.bitmap.data[idx + 1];
      var blue = img.bitmap.data[idx + 2];

      if ((red + green + blue) == 0) {
        img.bitmap.data[idx] = paletteColor[0];
        img.bitmap.data[idx + 1] = paletteColor[1];
        img.bitmap.data[idx + 2] = paletteColor[2];
        img.bitmap.data[idx + 3] = paletteColor[3];
      }
    });
    return img;
  }

  async getNumber(n, a = [null, null]) { // number, [numerator, denomenator]
    if (n === null || n === undefined) return null;

    // Is the number negative
    if (n < 0) return await this.getNegative(n, a);

    var img = null;
    if ([a[0], a[1]].filter(x => x === null).length === 0) { // is it a fraction?
      var negativeFraction = xor(a[0] < 0, a[1] < 0);
      a = a.map(x => Math.abs(x));
      if (a[0] < 0 || a[1] < 0) return undefined; // faction numerator and denomenator can't be less than zero
      if (/\./.exec(n.toString()) != null) return undefined; // is there a decimal in n? if yes, then return undefined as its formatted wrong

      // special case for fractions with negative numbers
      if (negativeFraction) {
        if (n == 0) return await this.getNegative(n, a);
        else return null;
      }

      var d = n.toString().length;
      switch (d) {
        case 1:
          return (n.toString()[0] == "0") ? await this.getFraction(a[0], a[1]) : await this.getSingleFraction(n, a[0], a[1]);
        case 2:
          return await this.getDoubleFraction(n, a[0], a[1]);
        case 3:
          return await this.getTripleFraction(n, a[0], a[1]);
        default:
          return await this.getFraction(a[0], a[1]);
      }
    }

    var d = (n % 1) * 10;
    if (d != 0) {
      switch (n.toString().replace('.', '').length) {
        case 2:
          return (n.toString()[0] == "0") ? await this.getDecimal(n) : await this.getSingleDecimal(n);
        case 3:
          return await this.getDoubleDecimal(n);
        case 4:
          return await this.getTripleDecimal(n);
        default:
          return null;
      }
    }

    switch (n.toString().length) {
      case 1:
        return await this.getSingleNumber(n);
      case 2:
        if (n < 0) return await this.getTripleNumber(n);
        return await this.getDoubleNumber(n);
      case 3:
        return await this.getTripleNumber(n);
      default:
        return null; // cool and good
    }
  }

  async getNegative(n, a = [null, null]) { // number, [numerator, denomenator]
    if (n === null || n === undefined) return null;
    var img = null;
    if ([a[0], a[1]].filter(x => x === null).length === 0) { // is it a fraction?
      if (a[0] < 0 || a[1] < 0) return undefined; // faction numerator and denomenator can't be less than zero
      if (/\./.exec(n.toString()) != null) return undefined; // is there a decimal in n? if yes, then return undefined as its formatted wrong
      var d = n.toString().length;
      switch (d) {
        case 2:
          return await this.getNegativeSingleFraction(n, a[0], a[1]);
        case 3:
          return await this.getNegativeDoubleFraction(n, a[0], a[1]);
        case 4:
          return await this.getNegativeTripleFraction(n, a[0], a[1]);
        default:
          return await this.getNegativeFraction(a[0], a[1]);
      }
    }

    var d = (n % 1) * 10;
    if (d != 0) {
      switch (n.toString().replace('.', '').length) {
        case 3:
          return (n.toString()[0] == "0") ? await this.getNegativeDecimal(n) : await this.getNegativeSingleDecimal(n);
        case 4:
          return await this.getNegativeDoubleDecimal(n);
        case 5:
          return await this.getNegativeTripleDecimal(n);
        default:
          return null;
      }
    }

    switch (n.toString().length) {
      case 2:
        return await this.getNegativeSingle(n);
      case 3:
        return await this.getNegativeDouble(n);
      case 4:
        return await this.getNegativeTriple(n);
      default:
        return null; // cool and good
    }
  }

  async getSingleNumber(n) {
    if (n < 0 || n > 10) return null;
    return await this.getTexture(`discordplaysminesweeper.base/numbers/${n}`);
  }
  async getMiniNumber(n) {
    if (n < 0 || n > 10) return null;
    return await this.getTexture(`discordplaysminesweeper.base/small-numbers/${n}`);
  }
  async getMicroNumberBlackBlue(n) {
    return await this.getMicroNumber(n,"tiny-numbers-black-on-blue");
  }
  async getMicroNumberWhiteBlue(n) {
    return await this.getMicroNumber(n,"tiny-numbers-white-on-blue");
  }
  async getMicroNumber(n, p="tiny-numbers") {
    if (n<0||n>9) return null;
    return await this.getTexture(`discordplaysminesweeper.base/${p}/${n}`);
  }
  async getDoubleNumber(n) {
    var base = await this.getTexture('discordplaysminesweeper.base/base-tile/number-double');
    if (/^\d\d$/.exec(n) === null) return null;
    base.composite(await this.getMiniNumber(Math.floor(n / 10)), 2, 3);
    base.composite(await this.getMiniNumber(n % 10), 9, 3);
    return base;
  }
  async getSingleDecimal(n) {
    var base = await this.getTexture('discordplaysminesweeper.base/base-tile/decimal-single');
    if (/^\d\.\d$/.exec(n) === null) return null;
    base.composite(await this.getMiniNumber(Math.floor(n / 1)), 2, 3);
    base.composite(await this.getMicroNumber(parseInt(n * 10) % 10), 12, 8);
    return base;
  }
  async getSingleFraction(a, b, c) {
    if ([a, b, c].map(x => /^\d$/.exec(x)).filter(x => x === null).length >= 1) return null;
    var base = await this.getTexture('discordplaysminesweeper.base/base-tile/fraction-single');
    base.composite(await this.getMiniNumber(a), 2, 3);
    base.composite(await this.getMicroNumber(b), 11, 2);
    base.composite(await this.getMicroNumber(c), 11, 10);
    return base;
  }
  async getDoubleDecimal(n) {
    if (/^\d\d\.\d$/.exec(n) === null) return null;
    var base = await this.getTexture('discordplaysminesweeper.base/base-tile/decimal-double');
    base.composite(await this.getMicroNumber(Math.floor(n / 10) % 10), 2, 6);
    base.composite(await this.getMicroNumber(Math.floor(n % 10)), 6, 6);
    base.composite(await this.getMicroNumber(parseInt(n * 10) % 10), 12, 6);
    return base;
  }
  async getDoubleFraction(a, b, c) {
    var base = await this.getTexture('discordplaysminesweeper.base/base-tile/fraction-double');
    if ([/^\d\d$/.exec(a), ...([b, c].map(x => /^\d$/.exec(x)))].filter(x => x === null).length >= 1) return null;
    base.composite(await this.getMicroNumber(Math.floor(a / 10) % 10), 2, 6);
    base.composite(await this.getMicroNumber(a % 10), 6, 6);
    base.composite(await this.getMicroNumber(b % 10), 11, 2);
    base.composite(await this.getMicroNumber(c % 10), 11, 10);
    return base;
  }
  async getTripleNumber(n) {
    var base = await this.getTexture('discordplaysminesweeper.base/base-tile/number-triple');
    if (/^\d\d\d$/.exec(n) === null) return null;
    base.composite(await this.getMicroNumber(Math.floor(n / 100)), 3, 6);
    base.composite(await this.getMicroNumber(Math.floor(n / 10) % 10), 7, 6);
    base.composite(await this.getMicroNumber(n % 10), 11, 6);
    return base;
  }
  async getTripleDecimal(n) {
    var base = await this.getTexture('discordplaysminesweeper.base/base-tile/decimal-triple');
    if (/^\d\d\d\.\d$/.exec(n) == null) return null;
    base.composite(await this.getMicroNumber(Math.floor(n / 100) % 10), 2, 2);
    base.composite(await this.getMicroNumber(Math.floor(n / 10) % 10), 6, 2);
    base.composite(await this.getMicroNumber(Math.floor(n) % 10), 10, 2);
    base.composite(await this.getMicroNumber(Math.floor(n * 10) % 10), 12, 10);
    return base;
  }
  async getTripleFraction(a, b, c) {
    var base = await this.getTexture('discordplaysminesweeper.base/base-tile/fraction-triple');
    if (/^\d\d\d$/.exec(a) == null || [b, c].map(x => /^\d$/.exec(x)).filter(x => x === null) >= 1) return null;
    base.composite(await this.getMicroNumber(Math.floor((a / 100) % 10)), 2, 2);
    base.composite(await this.getMicroNumber(Math.floor((a / 10) % 10)), 6, 2);
    base.composite(await this.getMicroNumber(a % 10), 10, 2);
    base.composite(await this.getMicroNumber(b % 10), 5, 8);
    base.composite(await this.getMicroNumber(c % 10), 12, 10);
    return base;
  }
  async getFraction(a, b) {
    var base = await this.getTexture('discordplaysminesweeper.base/base-tile/fraction');
    if ([a, b].map(x => /^\d$/.exec(x)).filter(x => x === null).length >= 1) return null;
    base.composite(await this.getMicroNumber(a), 7, 2);
    base.composite(await this.getMicroNumber(b), 7, 10);
    return base;
  }

  async getNegativeSingle(n) {
    var base = await this.getTexture('discordplaysminesweeper.base/base-tile/number-negative-single');
    n = Math.abs(Math.floor(n));
    if(n < 1 || n > 9) return null;
    base.composite(await this.getMiniNumber(n % 10), 8, 3);
    return base;
  }
  async getNegativeDouble(n) {
    var base = await this.getTexture('discordplaysminesweeper.base/base-tile/number-negative-double');
    n = Math.abs(Math.floor(n));
    if (/^\d\d$/.exec(n) == null) return null;
    base.composite(await this.getMicroNumber(Math.floor(n / 10) % 10), 8, 6);
    base.composite(await this.getMicroNumber(Math.floor(n) % 10), 12, 6);
    return base;
  }
  async getNegativeTriple(n) {
    var base = await this.getTexture('discordplaysminesweeper.base/base-tile/number-negative-triple');
    n = Math.abs(Math.floor(n));
    if (/^\d\d\d$/.exec(n) == null) return null;
    base.composite(await this.getMicroNumber(Math.floor(n / 100) % 10), 4, 6);
    base.composite(await this.getMicroNumber(Math.floor(n / 10) % 10), 8, 6);
    base.composite(await this.getMicroNumber(Math.floor(n) % 10), 12, 6);
    return base;
  }

  async getDecimal(n) {
    var base = await this.getTexture('discordplaysminesweeper.base/base-tile/decimal');
    if (/0\.\d/.exec(n) == null) return null;
    base.composite(await this.getMiniNumber((n * 10) % 10), 8, 3);
    return base;
  }

  async getNegativeSingleFraction(n, a, b) {
    var base = await this.getTexture('discordplaysminesweeper.base/base-tile/fraction-negative-single');
    n = Math.abs(Math.floor(n));
    if ([n, a, b].map(x => /^\d$/.exec(x)).filter(x => x === null).length >= 1) return null;
    base.composite(await this.getMicroNumber(n % 10), 6, 6);
    base.composite(await this.getMicroNumber(Math.floor(a) % 10), 11, 2);
    base.composite(await this.getMicroNumber(Math.floor(b) % 10), 11, 10);
    return base;
  }
  async getNegativeDoubleFraction(n, a, b) {
    var base = await this.getTexture('discordplaysminesweeper.base/base-tile/fraction-negative-double');
    n = Math.abs(Math.floor(n));
    if (/^\d\d$/.exec(n) == null || [a, b].map(x => /^\d$/.exec(x)).filter(x => x === null) >= 1) return null;
    base.composite(await this.getMicroNumber(Math.floor(n / 10) % 10), 7, 2);
    base.composite(await this.getMicroNumber(Math.floor(n) % 10), 11, 2);
    base.composite(await this.getMicroNumber(Math.floor(a % 10)), 5, 8);
    base.composite(await this.getMicroNumber(Math.floor(b % 10)), 12, 10);
    return base;
  }
  async getNegativeTripleFraction(n, a, b) {
    var base = await this.getTexture('discordplaysminesweeper.base/base-tile/fraction-negative-triple');
    n = Math.abs(Math.floor(n));
    if (/^\d\d\d$/.exec(n) == null || [a, b].map(x => /^\d$/.exec(x)).filter(x => x === null) >= 1) return null;
    base.composite(await this.getMicroNumber(Math.floor(n / 100) % 10), 4, 2);
    base.composite(await this.getMicroNumber(Math.floor(n / 10) % 10), 8, 2);
    base.composite(await this.getMicroNumber(Math.floor(n) % 10), 12, 2);
    base.composite(await this.getMicroNumber(Math.floor(a % 10)), 5, 8);
    base.composite(await this.getMicroNumber(Math.floor(b % 10)), 12, 10);
    return base;
  }
  async getNegativeFraction(a, b) {
    var base = await this.getTexture('discordplaysminesweeper.base/base-tile/fraction-negative');
    base.composite(await this.getMicroNumber(Math.floor(a) % 10), 10, 2);
    base.composite(await this.getMicroNumber(Math.floor(b) % 10), 10, 10);
    return base;
  }
  async getNegativeDecimal(n) {
    var base = await this.getTexture('discordplaysminesweeper.base/base-tile/decimal-negative');
    n = Math.abs(n);
    if (/0\.\d/.exec(n) == null) return null;
    base.composite(await this.getMiniNumber(Math.floor(n * 10) % 10), 9, 3);
    return base;
  }
  async getNegativeSingleDecimal(n) {
    var base = await this.getTexture('discordplaysminesweeper.base/base-tile/decimal-negative-single');
    n = Math.abs(n);
    if (/^\d\.\d$/.exec(n) === null) return null;
    base.composite(await this.getMicroNumber(Math.floor(n) % 10), 6, 6);
    base.composite(await this.getMicroNumber((n * 10) % 10), 12, 6);
    return base;
  }
  async getNegativeDoubleDecimal(n) {
    var base = await this.getTexture('discordplaysminesweeper.base/base-tile/decimal-negative-double');
    n = Math.abs(n);
    if (/^\d\d\.\d$/.exec(n) === null) return null;
    base.composite(await this.getMicroNumber(Math.floor(n / 10) % 10), 7, 2);
    base.composite(await this.getMicroNumber(Math.floor(n) % 10), 11, 2);
    base.composite(await this.getMicroNumber((n * 10) % 10), 12, 10);
    return base;
  }
  async getNegativeTripleDecimal(n) {
    var base = await this.getTexture('discordplaysminesweeper.base/base-tile/decimal-negative-triple');
    n = Math.abs(n);
    if (/^\d\d\d\.\d$/.exec(n) === null) return null;
    base.composite(await this.getMicroNumber(Math.floor(n / 100) % 10), 4, 2);
    base.composite(await this.getMicroNumber(Math.floor(n / 10) % 10), 8, 2);
    base.composite(await this.getMicroNumber(Math.floor(n) % 10), 12, 2);
    base.composite(await this.getMicroNumber((n * 10) % 10), 12, 10);
    return base;
  }
}

module.exports = LoadedTexturepack;
