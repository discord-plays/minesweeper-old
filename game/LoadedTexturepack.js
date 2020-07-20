class LoadedTexturepack {
  constructor(img) {
    this.img = img;
  }

  /*
   * Get icon at coordinates
   *
   * getIcon(x : int, y: int, w=16 : int, h=16 : int, raw=false : boolean)
   *  - Get an icon at position
   *  - Set raw to true to use exact position otherwise use 16x16 grid
   */

  getIcon(x, y, w = 16, h = 16, raw = false) {
    return this.img.crop(raw ? x : x * 16, raw ? y : y * 16, w, h);
  }

  /*
   * Main methods
   */

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
    if (n == 0) return this.getSpecialFlag("zero");
    if (n > 0) return this.getPositiveMine(n);
    else return this.getNegativeMine(Math.abs(n));
  }

  /*
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

  /*
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

  /*
   * Numbers for in the board
   *
   * getSingleNumber(n : int) : Jimp image
   */
  getNumber(n, a=[null,null])  { // number, [numerator, denomenator]
    if (n === null || n === undefined) return null;
    if ([a[0], a[1]].filter(x => x === null).length === 0) { // is it a fraction? 
      if (/\./.exec(n.toString()) != null) return undefined; // is there a decimal in n? if yes, then return undefined as its formatted wrong
      var d = n.toString().length;
      switch(d) {
        case 1:
          return this.getSingleFraction(n, a[0], a[1]);
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
      switch(n.toString().replace('.', '').length) {
        case 2:
          return this.getSingleDecimal(n);
        case 3:
          return this.getDoubleDecimal(n);
        case 4:
          return this.getTripleDecimal(n);
        default: 
          return 
      }
    }

  } 
  getSingleNumber(n) {
    if (n < 0 || n > 10) return null;
    return this.getIcon(n, 2);
  }
  getMiniNumber(n) {
    var topLeft = [0, 159];
    var size = [6, 10];
    return this.getIcon(n * size[0] + topLeft[0], topLeft[1], ...size, true);
  }
  getMicroNumber(n) {
    var topLeft = [60, 159];
    var size = [3, 5];
    var numbersTop = [1, 2, 3, 4, 5];
    var numbersBottom = [6, 7, 8, 9, 0];
    if (numbersTop.includes(n))
      return this.getIcon(
        numbersTop.indexOf(n) + topLeft[0],
        topLeft[1],
        ...size,
        true
      );
    if (numbersBottom.includes(n))
      return this.getIcon(
        numbersTop.indexOf(n) + topLeft[0],
        topLeft[1] + size[1],
        ...size,
        true
      );
  }
  getDoubleNumber(n) {
    var base = this.getIcon(10, 2);
    if (/^\d\d$/.exec(n) == null) return null;
    var num1 = Math.floor(n / 10);
    var num2 = n % 10;
    if (num1 == null || num2 == null) {
      console.error(`Error getting number ${num1} or ${num2}`);
      return null;
    }
    base.composite(this.getMiniNumber(num1), 2, 3);
    base.composite(this.getMiniNumber(num2), 9, 3);
    return base;
  }
  getSingleDecimal(n) {
    var base = this.getIcon(13, 2);
    if (/^\d\.\d$/.exec(n) == null) return null;
    var num1 = Math.floor(n / 1);
    var num2 = (n % 1) * 10;
    if (num1 == null || num2 == null) {
      console.error(`Error getting number ${num1} or ${num2}`);
      return null;
    }
    base.composite(this.getMiniNumber(num1), 2, 3);
    base.composite(this.getMiniNumber(num2), 12, 8);
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
    if (/^\d\d\.\d$/.exec(n) == null) return null;
    var base = this.getIcon(13, 3);
    var num3 = (n % 1) * 10;
    var num2 = Math.floor(n % 10);
    var num1 = Math.floor(n / 10) % 10;
    if ([num1, num2, num3].filter(x => x === null).length >= 1) {
      console.error(`Error getting number ${num1}, ${num2} or ${num3}`);
      return null;
    }
    base.composite(this.getMicroNumber(num1), 2, 5);
    base.composite(this.getMicroNumber(num2), 6, 5);
    base.composite(this.getMicroNumber(num3), 12, 5);
    return base;
  }
  getDoubleFraction(a, b, c) {
    var base = this.getIcon(12, 2);
    if (/^\d\d$/.exec(a) || [b, c].map(x => /^\d$/.exec(x)).filter(x => x === null).length >= 1) return null;
    var num2 = a % 10 
    var num1 = a - num2
    if ([num1, num2].filter(x => x === null).length >= 1) {
      console.error(`Error getting number ${num1} or ${num2}`);
      return null;
    }
    base.composite(this.getMicroNumber(num1), 2, 6);
    base.composite(this.getMicroNumber(num2), 6, 6);
    base.composite(this.getMicroNumber(b), 11, 2);
    base.composite(this.getMicroNumber(c), 11, 10);
    return base;
  }
  getTripleNumber(n) {
    var base = this.getIcon(15,4);
    if (/^\d\d\d$/.exec(n) == null) return null;  
    var num1 = Math.floor(n / 10) % 10;
    var num2 = Math.floor(n / 100);
    var num3 = n % 10;
    if ([num1, num2, num3].filter(x => x === null).length >= 1) {
      console.error(`Error getting number ${num1}, ${num2} or ${num3}`);
      return null;
    }
    base.composite(this.getMicroNumber(num1), 3, 6);
    base.composite(this.getMicroNumber(num2), 7, 6);
    base.composite(this.getMicroNumber(num3), 11, 6);
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
    base.composite(this.getMicroNumber(num2), 2, 6);
    base.composite(this.getMicroNumber(num3), 2, 10);
    base.composite(this.getMicroNumber(num4), 10, 11);
    return base;
  }
  getTripleFraction(a, b, c) {
    var base = this.getIcon(13, 1);
    if (/^\d\d\d$/.exec(a) == null || [b, c].map(x => /^\d$/.exec(x)).filter(x => x === null) >= 1) return null;
    var num1 = Math.floor((n / 100) % 10);
    var num2 = Math.floor((n / 10) % 100);
    var num3 = n % 10;
    if ([num1, num2, num3].filter(x => x === null).length >= 1) {
      console.error(`Error getting number ${num1}, ${num2} or ${num3}`);
      return null;
    }
    base.composite(this.getMicroNumber(num1),2 ,2);
    base.composite(this.getMicroNumber(num2),2 ,6);
    base.composite(this.getMicroNumber(num3),2 ,10);
    base.composite(this.getMicroNumber(b),5 ,8);
    base.composite(this.getMicroNumber(c),12 ,10);
    return base;
  }
  getFraction(a, b) {
    var base = this.getIcon(0, 3);
    if ([a, b].map(x => /^\d$/.exec(x)).filter(x => x === null).length >= 1) return null;
    base.composite(this.getMiniNumber(a), 7, 2);
    base.composite(this.getMicroNumber(b), 7, 10);
    return base;
  }
  getNegative(n) {
    var base = this.getIcon(1,3);
    n = Math.abs(Math.floor(n))
    if (n === null) {
      console.error(`Error getting number ${n}`)
      return null;
    }
    base.composite(this.getMiniNumber(n),8 ,3);
    return base;
  }
  /*
   * Debug cells
   *
   * getDebug() : Jimp image
   * getDebug2() : Jimp image
   */

  getDebug() {
    return this.getIcon(11, 5); // Pink and black checker
  }

  getDebug2() {
    return this.getIcon(12, 5); // Debug tile
  }

  /*
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

  /*
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
        return this.getIcon(14, 4); // Question clicked
      case 4:
        return this.getIcon(14, 5); // Exclamation clicked
    }
  }

  /*
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
    if (lettermap1.includes(n))
      return this.getIcon(lettermap1.indexOf(n) + 1, 5);
    if (lettermap2.includes(n)) return this.getIcon(lettermap2.indexOf(n), 6);
    if (lettermap3.includes(n)) return this.getIcon(lettermap3.indexOf(n), 7);
    return null;
  }

  getBorderNumber(n) {
    if (n >= 1 && m <= 5) return this.getIcon(n - 1, 8);
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
        lettermap1.indexOf(n) + topleft[0],
        topleft[1],
        ...size,
        true
      );
    if (lettermap2.includes(n))
      return this.getIcon(
        lettermap2.indexOf(n) + topleft[0],
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

  getBorder(n) {
    var s = n.toLowerCase().toString();
    if (![1, 2].includes(s.length)) return null;
    var isLetter = "abcdefghijklmnopqrstuvwxyz".includes(s[0]);
    switch (s.length) {
      case 1:
        return isLetter ?
          this.getBorderLetter(s[0]) :
          this.getBorderNumber(n % 10);
      case 2:
        return isLetter ?
          this.getBorderDoubleLetter(s[0], s[1]) :
          this.getBorderDoubleNumber(Math.floor(n / 10), n % 10);
      default:
        return null;
    }
  }

  getBorderCorner() {
    return this.getIcon(0, 5);
  }
}

module.exports = LoadedTexturepack;