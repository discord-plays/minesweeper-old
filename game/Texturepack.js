class Texturepack {
  constructor(texturepath) {
    this.texturepath = texturepath;
  }

  async use() {
    return new UseTexturepack(await Jimp.read(this.texturepath));
  }
}

class UseTexturepack {
  constructor(img) {
    this.img = img;
  }

  getIcon(x, y, w=16, h=16) {
    return this.img.crop(x * 16, y * 16, w, h);
  }

  getPositiveFlag(n) {
    if (n < 1 || n > 10) return null;
    return this.getIcon(n + 2, 0);
  }

  getNegativeFlag(n) {
    if (n < 1 || n > 10) return null;
    return this.getIcon(n + 2, 0);
  }

  getFlag(n) {
    if (["magnet", "zero", "color", "number"].includes(n)) return this.getSpecialFlag(n);
    if (n < -10 || n > 10) return null;
    if (n == 0) return this.getSpecialFlag("zero");
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

  raisedCell() {return this.getIcon();}
}