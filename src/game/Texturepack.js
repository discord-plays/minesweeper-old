const Jimp = require("jimp");
const LoadedTexturepack = require('./LoadedTexturepack')

class Texturepack {
  constructor(texturepath) {
    this.texturepath = texturepath;
    this.name = texturepath.replace(/^.*?\/([^\/]+)$/,'$1'); // Regex man
  }

  async use() {
    //var img = await Jimp.read(this.texturepath);
    //return new LoadedTexturepack(img);
    return new LoadedTexturepack(this.texturepath);
  }
}

module.exports = Texturepack;
