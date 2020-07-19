const glob = require("glob");

class Globber {
  constructor(importdir, pattern) {
    this.importdir = importdir;
    console.log(fs.existsSync(importdir));
    this.pattern = pattern;
    this.globpath = path.join(importdir, pattern);
  }

  load() {
    return new Promise((resolve) => {
      var that = this;
      glob(that.globpath, (err, files) => {
        if (err) return that.error(err);
        console.log(files);
        for (var i = 0; i < files.length; i++) {
          that.import(files[i]);
        }
        resolve();
      });
    })
  }
}

module.exports = Globber;