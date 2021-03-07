const gen = require('random-seed');
const Utils = require('./Utils');

class LoadedTexturepack {
  constructor(img) {
    this.img = img;
    this.palette = {
      width: 16,
      height: 3
    }
  }

  /**
   * Get icon at coordinates
   *
   * getIcon(x : int, y: int, w=16 : int, h=16 : int, raw=false : boolean)
   *  - Get an icon at position
   *  - Set raw to true to use exact position otherwise use 16x16 grid
   */


  getIcon(x, y, w = 16, h = 16, raw = false) {
    return this.img.clone().crop(raw ? x : x * 16, raw ? y : y * 16, w, h);
  }

  /**
   * Main methods
   */

  getPaletteColor(x) {
    // 0 starts at the end of the first row so shift by one less than the width to turn (-this.palette.width) to 0 for the top left corner
    var size = this.palette.width * this.palette.height;
    var lower = Math.abs(Math.floor(x / size));
    return this.indexIntoPalette((x + (this.palette.width - 1) + lower * size) % size);
  }
  indexIntoPalette(x) {
    var topLeft = [208, 144];
    var pos = [((x % this.palette.width)), Math.floor(x / this.palette.width)];
    return this.getIcon(topLeft[0] + pos[0], topLeft[1] + pos[1], 1, 1, true);
  }
  getFlag(n) {
    var specialFlag = this.getSpecialFlag(n);
    if (specialFlag != null) return specialFlag;
    if (n < -10 || n > 10) return null;
    if (n == 0) return this.getSpecialFlag("zero");
    if (n > 0) return this.getPositiveFlag(n);
    else return this.getNegativeFlag(Math.abs(n));
  }
  getMine(n) {
    var specialMine = this.getSpecialMine(n);
    if (specialMine != null) return specialMine;
    if (n < -10 || n > 10) return null;
    if (n == 0) return this.getSpecialMine("zero");
    if (n > 0) return this.getPositiveMine(n);
    else return this.getNegativeMine(Math.abs(n));
  }

  /**
   * Extra methods for flags
   */

  getPositiveFlag(n) {
    if (n < 1 || n > 10) return null;
    return this.getIcon(n + 1, 0);
  }

  getNegativeFlag(n) {
    if (n < 1 || n > 10) return null;
    return this.getIcon(n + 1, 1);
  }

  getSpecialFlag(name) {
    switch (name) {
      case "number":
        return this.getIcon(0, 1);
      case "color":
        return this.getIcon(1, 1);
      case "zero":
        return this.getIcon(12, 0);
      case "magnet":
        return this.getIcon(12, 1);
      case "fraction":
        return this.getIcon(15, 1);
      case "decimal":
        return this.getIcon(15, 2);
      case "multiply":
        return this.getIcon(15, 3);
    }
    return null;
  }

  /**
   * Extra methods for mines
   */

  getPositiveMine(n) {
    if (n < 1 || n > 10) return null;
    return this.getIcon(n + 1, 3);
  }

  getNegativeMine(n) {
    if (n < 1 || n > 10) return null;
    return this.getIcon(n, 4);
  }

  getSpecialMine(name) {
    switch (name) {
      case "number":
        return this.getIcon(11, 4);
      case "color":
        return this.getIcon(12, 3);
      case "zero":
        return this.getIcon(0, 4);
      case "magnet":
        return this.getIcon(12, 4);
      case "fraction":
        return this.getIcon(14, 0);
      case "decimal":
        return this.getIcon(14, 1);
      case "multiply":
        return this.getIcon(15, 0);
    }
  }

  /**
   * Numbers for in the board
   *
   * getNumber(n : int, a : int[])
   * getSingleNumber(n : int) : Jimp image
   */

  // A wrapper around getNumber to change the text color to match the palette
  getNumberWithPaletteColor(n, ...a) {
    var img = this.getNumber(n, ...a);
    if (img == null) return img;
    var paletteColor = this.getPaletteColor(Math.floor(n)).bitmap.data;
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

  getNumber(n, a = [null, null]) { // number, [numerator, denomenator]
    if (n === null || n === undefined) return null;

    // Is the number negative
    if (n < 0) return this.getNegative(n, a);

    var img = null;
    if ([a[0], a[1]].filter(x => x === null).length === 0) { // is it a fraction?
      var negativeFraction = Utils.xor(a[0] < 0, a[1] < 0);
      a = a.map(x => Math.abs(x));
      if (a[0] < 0 || a[1] < 0) return undefined; // faction numerator and denomenator can't be less than zero
      if (/\./.exec(n.toString()) != null) return undefined; // is there a decimal in n? if yes, then return undefined as its formatted wrong

      // special case for fractions with negative numbers
      if (negativeFraction) {
        if (n == 0) return this.getNegative(n, a);
        else return null;
      }

      var d = n.toString().length;
      switch (d) {
        case 1:
          return (n.toString()[0] == "0") ? this.getFraction(a[0], a[1]) : this.getSingleFraction(n, a[0], a[1]);
        case 2:
          return this.getDoubleFraction(n, a[0], a[1]);
        case 3:
          return this.getTripleFraction(n, a[0], a[1]);
        default:
          return this.getFraction(a[0], a[1]);
      }
    }

    var d = (n % 1) * 10;
    if (d != 0) {
      switch (n.toString().replace('.', '').length) {
        case 2:
          return (n.toString()[0] == "0") ? this.getDecimal(n) : this.getSingleDecimal(n);
        case 3:
          return this.getDoubleDecimal(n);
        case 4:
          return this.getTripleDecimal(n);
        default:
          return null;
      }
    }

    switch (n.toString().length) {
      case 1:
        return this.getSingleNumber(n);
      case 2:
        if (n < 0) return this.getTripleNumber(n);
        return this.getDoubleNumber(n);
      case 3:
        return this.getTripleNumber(n);
      default:
        return null; // cool and good
    }
  }

  getNegative(n, a = [null, null]) { // number, [numerator, denomenator]
    if (n === null || n === undefined) return null;
    var img = null;
    if ([a[0], a[1]].filter(x => x === null).length === 0) { // is it a fraction?
      if (a[0] < 0 || a[1] < 0) return undefined; // faction numerator and denomenator can't be less than zero
      if (/\./.exec(n.toString()) != null) return undefined; // is there a decimal in n? if yes, then return undefined as its formatted wrong
      var d = n.toString().length;
      switch (d) {
        case 2:
          return this.getNegativeSingleFraction(n, a[0], a[1]);
        case 3:
          return this.getNegativeDoubleFraction(n, a[0], a[1]);
        case 4:
          return this.getNegativeTripleFraction(n, a[0], a[1]);
        default:
          return this.getNegativeFraction(a[0], a[1]);
      }
    }

    var d = (n % 1) * 10;
    if (d != 0) {
      switch (n.toString().replace('.', '').length) {
        case 3:
          return (n.toString()[0] == "0") ? this.getNegativeDecimal(n) : this.getNegativeSingleDecimal(n);
        case 4:
          return this.getNegativeDoubleDecimal(n);
        case 5:
          return this.getNegativeTripleDecimal(n);
        default:
          return null;
      }
    }

    switch (n.toString().length) {
      case 2:
        return this.getNegativeSingle(n);
      case 3:
        return this.getNegativeDouble(n);
      case 4:
        return this.getNegativeTriple(n);
      default:
        return null; // cool and good
    }
  }

  getSingleNumber(n) {
    if (n < 0 || n > 10) return null;
    return this.getIcon(n, 2);
  }
  getMiniNumber(n) {
    var topLeft = [0, 160];
    var size = [6, 10];
    return this.getIcon(n * size[0] + topLeft[0], topLeft[1], ...size, true);
  }
  getMicroNumber(n) {
    var topLeft = [60, 160];
    var size = [3, 5];
    var numbersTop = [1, 2, 3, 4, 5];
    var numbersBottom = [6, 7, 8, 9, 0];
    if (numbersTop.includes(n))
      return this.getIcon(
        numbersTop.indexOf(n) * size[0] + topLeft[0],
        topLeft[1],
        ...size,
        true
      );
    else if (numbersBottom.includes(n))
      return this.getIcon(
        numbersBottom.indexOf(n) * size[0] + topLeft[0],
        topLeft[1] + size[1],
        ...size,
        true
      );
    else return null;
  }
  getDoubleNumber(n) {
    var base = this.getIcon(10, 2);
    if (/^\d\d$/.exec(n) === null) return null;
    var num1 = this.getMiniNumber(Math.floor(n / 10));
    var num2 = this.getMiniNumber(n % 10);
    if (num1 == null || num2 == null) {
      console.error(`Error getting number ${num1} or ${num2}`);
      return null;
    }
    base.composite(num1, 2, 3);
    base.composite(num2, 9, 3);
    return base;
  }
  getSingleDecimal(n) {
    var base = this.getIcon(13, 2);
    if (/^\d\.\d$/.exec(n) === null) return null;
    var num1 = Math.floor(n / 1);
    var num2 = parseInt(n * 10) % 10;
    if (num1 == null || num2 == null) {
      console.error(`Error getting number ${num1} or ${num2}`);
      return null;
    }
    base.composite(this.getMiniNumber(num1), 2, 3);
    base.composite(this.getMicroNumber(num2), 12, 8);
    return base;
  }

  getSingleFraction(a, b, c) {
    if ([a, b, c].map(x => /^\d$/.exec(x)).filter(x => x === null).length >= 1) return null;
    var base = this.getIcon(11, 2);
    base.composite(this.getMiniNumber(a), 2, 3);
    base.composite(this.getMicroNumber(b), 11, 2);
    base.composite(this.getMicroNumber(c), 11, 10);
    return base;
  }
  getDoubleDecimal(n) {
    if (/^\d\d\.\d$/.exec(n) === null) return null;
    var base = this.getIcon(13, 3);
    var num3 = this.getMicroNumber(parseInt(n * 10) % 10);
    var num2 = this.getMicroNumber(Math.floor(n % 10));
    var num1 = this.getMicroNumber(Math.floor(n / 10) % 10);
    if ([num1, num2, num3].filter(x => x === null).length >= 1) {
      console.error(`Error getting number ${num1}, ${num2} or ${num3}`);
      return null;
    }
    base.composite(num1, 2, 6);
    base.composite(num2, 6, 6);
    base.composite(num3, 12, 6);
    return base;
  }
  getDoubleFraction(a, b, c) {
    var base = this.getIcon(12, 2);
    if ([/^\d\d$/.exec(a), ...([b, c].map(x => /^\d$/.exec(x)))].filter(x => x === null).length >= 1) return null;
    var num1 = this.getMicroNumber(Math.floor(a / 10) % 10);
    var num2 = this.getMicroNumber(a % 10);
    var num3 = this.getMicroNumber(b % 10);
    var num4 = this.getMicroNumber(c % 10);
    if ([num1, num2, num3, num4].filter(x => x === null).length >= 1) {
      console.error(`Error getting number ${num1}, ${num2}, ${num3} or ${num4}`);
      return null;
    }
    base.composite(num1, 2, 6);
    base.composite(num2, 6, 6);
    base.composite(num3, 11, 2);
    base.composite(num4, 11, 10);
    return base;
  }
  getTripleNumber(n) {
    var base = this.getIcon(15, 4);
    if (/^\d\d\d$/.exec(n) === null) return null;
    var num1 = this.getMicroNumber(Math.floor(n / 100));
    var num2 = this.getMicroNumber(Math.floor(n / 10) % 10);
    var num3 = this.getMicroNumber(n % 10);
    if ([num1, num2, num3].filter(x => x === null).length >= 1) {
      console.error(`Error getting number ${num1}, ${num2} or ${num3}`);
      return null;
    }
    base.composite(num1, 3, 6);
    base.composite(num2, 7, 6);
    base.composite(num3, 11, 6);
    return base;
  }
  getTripleDecimal(n) {
    var base = this.getIcon(13, 4);
    if (/^\d\d\d\.\d$/.exec(n) == null) return null;
    var num1 = Math.floor(n / 100);
    var num2 = Math.floor((n / 10) % 10);
    var num3 = Math.floor(n % 10);
    var num4 = (n * 10) % 10;
    if ([num1, num2, num3, num4].filter(x => x === null).length >= 1) {
      console.error(`Error getting number ${num1}, ${num2}, ${num3} or ${num4}`);
      return null;
    }
    base.composite(this.getMicroNumber(num1), 2, 2);
    base.composite(this.getMicroNumber(num2), 6, 2);
    base.composite(this.getMicroNumber(num3), 10, 2);
    base.composite(this.getMicroNumber(num4), 12, 10);
    return base;
  }
  getTripleFraction(a, b, c) {
    var base = this.getIcon(13, 1);
    if (/^\d\d\d$/.exec(a) == null || [b, c].map(x => /^\d$/.exec(x)).filter(x => x === null) >= 1) return null;
    var num1 = this.getMicroNumber(Math.floor((a / 100) % 10));
    var num2 = this.getMicroNumber(Math.floor((a / 10) % 10));
    var num3 = this.getMicroNumber(a % 10);
    var num4 = this.getMicroNumber(b % 10);
    var num5 = this.getMicroNumber(c % 10);
    if ([num1, num2, num3, num4, num5].filter(x => x === null).length >= 1) {
      console.error(`Error getting number ${num1}, ${num2}, ${num3}, ${num4} or ${num5}`);
      return null;
    }
    base.composite(num1, 2, 2);
    base.composite(num2, 6, 2);
    base.composite(num3, 10, 2);
    base.composite(num4, 5, 8);
    base.composite(num5, 12, 10);
    return base;
  }
  getFraction(a, b) {
    var base = this.getIcon(0, 3);
    if ([a, b].map(x => /^\d$/.exec(x)).filter(x => x === null).length >= 1) return null;
    base.composite(this.getMicroNumber(a), 7, 2);
    base.composite(this.getMicroNumber(b), 7, 10);
    return base;
  }

  getNegativeSingle(n) {
    var base = this.getIcon(1, 3);
    n = Math.abs(Math.floor(n))
    if (n === null) {
      console.error(`Error getting number ${n}`)
      return null;
    }
    base.composite(this.getMiniNumber(n), 8, 3);
    return base;
  }
  getNegativeDouble(n) {
    var base = this.getIcon(15, 6);
    n = Math.abs(Math.floor(n));
    if (n === null) {
      console.error(`Error getting number ${n}`)
      return null;
    }
    base.composite(this.getMicroNumber(Math.floor((n / 10) % 10)), 8, 6);
    base.composite(this.getMicroNumber(Math.floor(n % 10)), 12, 6);
    return base;
  }
  getNegativeTriple(n) {
    var base = this.getIcon(15, 7);
    n = Math.abs(Math.floor(n));
    if (n === null) {
      console.error(`Error getting number ${n}`)
      return null;
    }
    base.composite(this.getMicroNumber(Math.floor((n / 100) % 10)), 4, 6);
    base.composite(this.getMicroNumber(Math.floor((n / 10) % 10)), 8, 6);
    base.composite(this.getMicroNumber(Math.floor(n % 10)), 12, 6);
    return base;
  }

  getDecimal(n) {
    var base = this.getIcon(15, 5);
    if (/\./.exec(n) == null) return null;
    base.composite(this.getMiniNumber(n * 10), 8, 3);
    return base;
  }

  getNegativeSingleFraction(n, a, b) {
    var base = this.getIcon(13, 8);
    n = Math.abs(Math.floor(n));
    if (n === null) {
      console.error(`Error getting number ${n}`)
      return null;
    }
    base.composite(this.getMicroNumber(n), 6, 6);
    base.composite(this.getMicroNumber(Math.floor(a % 10)), 11, 2);
    base.composite(this.getMicroNumber(Math.floor(b % 10)), 11, 10);
    return base;
  }
  getNegativeDoubleFraction(n, a, b) {
    var base = this.getIcon(13, 7);
    n = Math.abs(Math.floor(n));
    if (n === null) {
      console.error(`Error getting number ${n}`)
      return null;
    }
    base.composite(this.getMicroNumber(Math.floor((n / 10) % 10)), 7, 2);
    base.composite(this.getMicroNumber(Math.floor(n % 10)), 11, 2);
    base.composite(this.getMicroNumber(Math.floor(a % 10)), 5, 8);
    base.composite(this.getMicroNumber(Math.floor(b % 10)), 12, 10);
    return base;
  }
  getNegativeTripleFraction(n, a, b) {
    var base = this.getIcon(14, 7);
    n = Math.abs(Math.floor(n));
    if (n === null) {
      console.error(`Error getting number ${n}`)
      return null;
    }
    base.composite(this.getMicroNumber(Math.floor((n / 100) % 10)), 4, 2);
    base.composite(this.getMicroNumber(Math.floor((n / 10) % 10)), 8, 2);
    base.composite(this.getMicroNumber(Math.floor(n % 10)), 12, 2);
    base.composite(this.getMicroNumber(Math.floor(a % 10)), 5, 8);
    base.composite(this.getMicroNumber(Math.floor(b % 10)), 12, 10);
    return base;
  }
  getNegativeFraction(a, b) {
    var base = this.getIcon(12, 8);
    base.composite(this.getMicroNumber(Math.floor(a % 10)), 10, 2);
    base.composite(this.getMicroNumber(Math.floor(b % 10)), 10, 10);
    return base;
  }
  getNegativeDecimal(n) {
    var base = this.getIcon(12, 9);
    if (/\./.exec(n) == null) return null;
    base.composite(this.getMiniNumber(n * 10), 9, 3);
    return base;
  }
  getNegativeSingleDecimal(n) {
    var base = this.getIcon(15, 8);
    if (/^-\d\.\d$/.exec(n) === null) return null;
    n = Math.abs(n);
    var num1 = Math.floor(n / 1);
    var num2 = (n * 10) % 10;
    if (num1 == null || num2 == null) {
      console.error(`Error getting number ${num1} or ${num2}`);
      return null;
    }
    base.composite(this.getMicroNumber(num1), 6, 6);
    base.composite(this.getMicroNumber(num2), 12, 6);
    return base;
  }
  getNegativeDoubleDecimal(n) {
    var base = this.getIcon(12, 7);
    if (/^-\d\d\.\d$/.exec(n) === null) return null;
    n = Math.abs(n);
    var num1 = Math.floor(n / 10) % 10;
    var num2 = Math.floor(n / 1) % 10;
    var num3 = (n * 10) % 10;
    if (num1 == null || num2 == null || num3 == null) {
      console.error(`Error getting number ${num1}, ${num2} or ${num3}`);
      return null;
    }
    base.composite(this.getMicroNumber(num1), 7, 2);
    base.composite(this.getMicroNumber(num2), 11, 2);
    base.composite(this.getMicroNumber(num3), 12, 10);
    return base;
  }
  getNegativeTripleDecimal(n) {
    var base = this.getIcon(14, 8);
    if (/^-\d\d\d\.\d$/.exec(n) === null) return null;
    n = Math.abs(n);
    var num1 = Math.floor(n / 100) % 10;
    var num2 = Math.floor(n / 10) % 10;
    var num3 = Math.floor(n / 1) % 10;
    var num4 = (n * 10) % 10;
    if (num1 == null || num2 == null || num3 == null || num4 == null) {
      console.error(`Error getting number ${num1}, ${num2}, ${num3} or ${num4}`);
      return null;
    }
    base.composite(this.getMicroNumber(num1), 4, 2);
    base.composite(this.getMicroNumber(num2), 8, 2);
    base.composite(this.getMicroNumber(num3), 12, 2);
    base.composite(this.getMicroNumber(num4), 12, 10);
    return base;
  }

  /**
   * Debug cells
   *
   * getDebug() : Jimp image
   * getDebug2() : Jimp image
   */

  getDebugPinkBlack() {
    return this.getIcon(11, 5); // Pink and black checker
  }

  getDebugPinkWhite() {
    return this.getIcon(14, 6); // Pink and white checker
  }

  getDebugTile() {
    return this.getIcon(12, 5); // Debug tile
  }

  getGithub() {
    return this.getIcon(10, 7, 32, 32);
  }

  /**
   * Raised and lowered cells
   *
   * raisedCell() : Jimp image
   * loweredCell() : Jimp image
   */

  raisedCell() {
    return this.getIcon(1, 0);
  }

  loweredCell() {
    return this.getIcon(0, 0);
  }

  /**
   * Extra cells
   *
   * raisedExtra(n : int) : Jimp image
   *  - Get raised extra texture
   *
   * loweredExtra(n : int) : Jimp image
   *  - Get lowered extra texture
   */

  raisedExtra(n) {
    switch (n) {
      case 1:
        return this.getIcon(13, 5); // Melon unclicked
      case 2:
        return this.getIcon(13, 0); // Banana unclicked
      case 3:
        return this.getIcon(14, 4); // Question unclicked
      case 4:
        return this.getIcon(14, 5); // Exclamation unclicked
    }
  }

  loweredExtra(n) {
    switch (n) {
      case 1:
        return this.getIcon(13, 6); // Melon clicked
      case 2:
        return this.getIcon(12, 6); // Banana clicked
      case 3:
        return this.getIcon(14, 2); // Question clicked
      case 4:
        return this.getIcon(14, 3); // Exclamation clicked
    }
  }

  // For red exclamation mark
  getRedExclamationMark(n, ...a) {
    var img = this.raisedExtra(4);
    if (img == null) return img;
    var paletteColor = [255,0,0,255];
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

  /**
   * Boardered letters and numbers
   *
   * getBorderLetter(n : string) : Jimp image
   *  - Get border letter from texture file
   *
   * getBorderNumber(n : int) : Jimp image
   *  - Get border number from texture file
   *
   * getMiniBorderLetter(n : string) : Jimp image
   *  - Get mini border letter for adding to the double base
   *
   * getMiniBorderNumber(n : int) : Jimp image
   *  - Get mini border number for adding to the double base
   *
   * getBorderDoubleLetter(a : int, b : int) : Jimp image
   *  - Get the double base and add the two letters
   *
   * getBorderDoubleNumber(a : string, b : string) : Jimp image
   *  - Get the double base and add the two numbers
   *
   * getBorder(n : string) : Jimp image
   *  - Get a border cell using one or two characters
   */

  getBorderLetter(n) {
    n = n.toLowerCase();
    var lettermap1 = "abcdefghij";
    var lettermap2 = "klmnopqrstuv";
    var lettermap3 = "wxyz";
    if (lettermap1.includes(n)) return this.getIcon(lettermap1.indexOf(n) + 1, 5);
    if (lettermap2.includes(n)) return this.getIcon(lettermap2.indexOf(n), 6);
    if (lettermap3.includes(n)) return this.getIcon(lettermap3.indexOf(n), 7);
    return null;
  }

  getBorderNumber(n) {
    if (n >= 1 && n <= 5) return this.getIcon(n - 1, 8);
    if (n >= 6 && n < 10) return this.getIcon(n - 6, 9);
    return null;
  }

  getMiniBorderLetter(n) {
    n = n.toLowerCase();
    var topleft = [80, 112];
    var size = [6, 10];
    var lettermap1 = "abcdefghijklm";
    var lettermap2 = "nopqrstuvwxyz";
    if (lettermap1.includes(n))
      return this.getIcon(
        lettermap1.indexOf(n) * 6 + topleft[0],
        topleft[1],
        ...size,
        true
      );
    if (lettermap2.includes(n))
      return this.getIcon(
        lettermap2.indexOf(n) * 6 + topleft[0],
        topleft[1] + size[1],
        ...size,
        true
      );
    return null;
  }

  getMiniBorderNumber(n) {
    if (n < 0 || n > 9) return null;
    var topleft = [80, 112];
    var size = [6, 10];
    return this.getIcon(
      n * size[0] + topleft[0],
      topleft[1] + size[1] * 2,
      ...size,
      true
    );
  }

  getBorderDoubleLetter(a, b) {
    var doublebase = this.getIcon(4, 7);
    var let1 = this.getMiniBorderLetter(a);
    var let2 = this.getMiniBorderLetter(b);
    if (let1 == null || let2 == null) {
      console.error(`Error getting letter ${a} or ${b}`);
      return null;
    }
    doublebase.composite(let1, 2, 3);
    doublebase.composite(let2, 9, 3);
    return doublebase;
  }

  getBorderDoubleNumber(a, b) {
    var doublebase = this.getIcon(4, 7);
    var num1 = this.getMiniBorderNumber(a);
    var num2 = this.getMiniBorderNumber(b);
    if (num1 == null || num2 == null) {
      console.error(`Error getting number ${a} or ${b}`);
      return null;
    }
    doublebase.composite(num1, 2, 3);
    doublebase.composite(num2, 9, 3);
    return doublebase;
  }

  getBorderIcon(s) {
    var icon = this.getBorderIconMiddle(s);
    if (icon == null) return null;
    var backing = this.getIcon(4, 9);
    backing.composite(icon, 5, icon.bitmap.height == 5 ? 6 : 3);
    return backing;
  }

  getBorderIconMiddle(s) {
    switch (s) {
      case "filled-blob":
        return this.getBorderMicroIcon(1);
      case "sad":
        return this.getBorderMicroIcon(2);
      case "happy":
        return this.getBorderMicroIcon(3);
      case "empty-blob":
        return this.getBorderMicroIcon(4);
      case "shrug":
        return this.getBorderMiniIcon(1);
      default:
        return null;
    }
  }

  getBorder(n) {
    var s = n.toString().toLowerCase();
    if (![1, 2].includes(s.length)) {
      return this.getBorderIcon(s);
    }
    var isLetter = "abcdefghijklmnopqrstuvwxyz".includes(s[0]);
    switch (s.length) {
      case 1:
        return isLetter ? this.getBorderLetter(s[0]) : this.getBorderNumber(n % 10);
      case 2:
        return isLetter ? this.getBorderDoubleLetter(s[0], s[1]) : this.getBorderDoubleNumber(Math.floor(n / 10), n % 10);
      default:
        return null;
    }
  }

  getBorderMiniIcon(n) {
    if (n < 1 || n > 1) return null;
    n--;
    var topleft = [152, 132];
    var size = [6, 10];
    return this.getIcon(
      n * size[0] + topleft[0],
      topleft[1],
      ...size,
      true
    );
  }

  getBorderMicroIcon(n) {
    if (n < 1 || n > 4) return null;
    n--;
    var topleft = [140, 132];
    var size = [6, 5];
    return this.getIcon(
      (n % 2) * size[0] + topleft[0],
      topleft[1] + size[1] * Math.floor(n / 2),
      ...size,
      true
    );
  }

  getBorderCorner() {
    return this.getIcon(0, 5);
  }
}

module.exports = LoadedTexturepack;