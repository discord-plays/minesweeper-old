// Run `node -e 'require("./test")(x=>x.getDebugPinkBlack())'` to test the default texture pack
function getTest(f) {
  const Assets = require('../game/Assets');
  const Jimp = require('jimp');
  const path = require('path');
  var a = new Assets(path.join(__dirname, '..'));
  a.load().then(() => a.find("default").use().then(d => {
    return f(d).resize(256, 256, Jimp.RESIZE_NEAREST_NEIGHBOR).write('.texturepack-test.png');
  }).catch(reason => {
    console.error(reason);
  })).catch(reason => {
    console.error(reason);
  });
}

module.exports = getTest;