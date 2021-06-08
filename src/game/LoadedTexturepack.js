const Jimp = require('jimp');
const path = require('path');

class LoadedTexturepack {
  constructor(texturepath) {
    this.texturepath = texturepath == "%%default%%" ? "mods/$$/assets" : texturepath;
    this.cached = {};
  }

  /**
   * Get a texture by its asset id
   * @param {integer} index 
   * @returns Jimp image
   */
  async getTexture(a) {
    if(this.cached.hasOwnProperty(a)) return this.cached[a];
    let b = path.join(this.texturepath.replace('$$',a.split('/')[0]),`${a}.png`);
    console.log(b);
    this.cached[a] = await Jimp.read(b);
    console.log('Finished jimp.read');
    return this.cached[a];
  }

  /**
   * 0 starts at the end of the first row so shift by one less than the width to turn (-this.palette.width) to 0 for the top left corner
   * @param {integer} index 
   * @returns Jimp image
   */
  getPaletteColor(index) {
    var size = this.palette.width * this.palette.height;
    var lower = Math.abs(Math.floor(index / size));
    return this.indexIntoPalette((index + (this.palette.width - 1) + lower * size) % size);
  }

  /**
   * Get the color in the palette at the specified index
   * @param {integer} index 
   * @returns Jimp image
   */
  indexIntoPalette(index) {
    var topLeft = [208, 144];
    var pos = [((index % this.palette.width)), Math.floor(index / this.palette.width)];
    return this.getIcon(topLeft[0] + pos[0], topLeft[1] + pos[1], 1, 1, true);
  }

  /**
   * Get a flag by its name or number
   * @param {string/integer} n 
   * @returns Jimp image
   */
  getFlag(n) {
    var specialFlag = this.getSpecialFlag(n);
    if (specialFlag != null) return specialFlag;
    if (n < -10 || n > 10) return null;
    if (n == 0) return this.getSpecialFlag("zero");
    if (n > 0) return this.getPositiveFlag(n);
    else return this.getNegativeFlag(Math.abs(n));
  }

  /**
   * Get a mine by its name or number
   * @param {string/integer} n 
   * @returns Jimp image
   */
  getMine(n) {
    var specialMine = this.getSpecialMine(n);
    if (specialMine != null) return specialMine;
    if (n < -10 || n > 10) return null;
    if (n == 0) return this.getSpecialMine("zero");
    if (n > 0) return this.getPositiveMine(n);
    else return this.getNegativeMine(Math.abs(n));
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
   * Get mine cell
   * @returns Jimp image
   */
  async getMine() {
    return await this.getDebugPinkBlack();
  }

  /**
   * Get flag cell
   * @returns Jimp image
   */
  async getFlag() {
    return await this.getDebugPinkBlack();
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
    if(n >= 1 && n < 10) return await this.getTexture('discordplaysminesweeper.base/border/small-number/'+n);
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
}

module.exports = LoadedTexturepack;
