class LoadedTexturepack {
  constructor(img) {
    this.img = img;
  }

  getIcon(x, y, w = 16, h = 16, raw = false) {
    return this.img.crop(raw ? x : x * 16, raw ? y : y * 16, w, h);
  }

  getPositiveFlag(n) {
    if (n < 1 || n > 10) return null;
    return this.getIcon(n + 1, 0);
  }

  getNegativeFlag(n) {
    if (n < 1 || n > 10) return null;
    return this.getIcon(n + 1, 1);
  }

  getFlag(n) {
    if (["magnet", "zero", "color", "number"].includes(n)) return this.getSpecialFlag(n);
    if (n < -10 || n > 10) return null;
    if (n == 0) return this.getSpecialFlag("zero");
    if (n > 0) return this.getPositiveFlag(n);
    else return this.getNegativeFlag(Math.abs(n));
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
    }
    return null;
  }

  getPositiveMine(n) {
    if (n < 1 || n > 10) return null;
    return this.getIcon(n + 1, 3);
  }

  getNegativeMine(n) {
    if (n < 1 || n > 10) return null;
    return this.getIcon(n, 4);
  }

  getMine(n) {
    if (["magnet", "zero", "color", "number"].includes(n)) return this.getSpecialMine(n);
    if (n < -10 || n > 10) return null;
    if (n == 0) return this.getSpecialFlag("zero");
    if (n > 0) return this.getPositiveMine(n);
    else return this.getNegativeMine(Math.abs(n));
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
    }
  }

  getNumber(n) {
    if (n < 0 || n > 10) return null;
    return this.getIcon(n, 2);
  }

  getDebug() {
    return this.getIcon(11, 5);
  }

  getDebug2() {
    return this.getIcon(12, 5);
  }

  raisedCell() {
    return this.getIcon(1, 0);
  }

  loweredCell() {
    return this.getIcon(0, 0);
  }

  raisedExtra(n) {
    switch (n) {
      case 1:
        return this.getIcon(13, 5);
      case 2:
        return this.getIcon(13, 0);
    }
  }

  loweredExtra(n) {
    switch (n) {
      case 1:
        return this.getIcon(13, 6);
      case 2:
        return this.getIcon(12, 6);
    }
  }

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
    if (lettermap1.includes(n)) return this.getIcon(lettermap1.indexOf(n) + topleft[0], topleft[1], ...size, true);
    if (lettermap2.includes(n)) return this.getIcon(lettermap2.indexOf(n) + topleft[0], topleft[1] + size[1], ...size, true);
    return null;
  }

  getMiniBorderNumber(n) {
    if (n < 0 || n > 9) return null;
    var topleft = [80, 112];
    var size = [6, 10];
    return this.getIcon(n + topleft[0], topleft[1] + size[1] * 2, ...size, true);
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

  getBorder(n) {
    var s = n.toLowerCase().toString();
    if (![1, 2].includes(s.length)) return null;
    var isLetter = "abcdefghijklmnopqrstuvwxyz".includes(s[0]);
    switch (s.length) {
      case 1:
        return isLetter ? this.getBorderLetter(s[0]) : this.getBorderNumber(n % 10);
      case 2:
        return isLetter ? this.getBorderDoubleLetter(s[0], s[1]) : this.getBorderDoubleNumber(Math.floor(n / 10), n % 10);
    }
    return null;
  }
}

module.exports = LoadedTexturepack;