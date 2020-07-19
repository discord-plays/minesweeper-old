const Jimp = require("Jimp");
const LoadedTexturepack = require('./LoadedTexturepack')

class Texturepack {
  constructor(texturepath) {
    this.texturepath = texturepath;
    this.name = texturepath.replace(/^.*?\/([^\/]+)\.png$/,'$1');
  }

  async use() {
    var img = await Jimp.read(this.texturepath)
    return new LoadedTexturepack(img);
  }
}

module.exports = Texturepack;