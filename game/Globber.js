class Globber {
  constructor(importdir) {
    this.importdir = importdir;
  }

  load() {
    var that = this;
    glob(path.join(this.basedir, 'assets', '*.png'), (err, files) => {
      if (err) that.error(err);
      for (var i = 0; i < files.length; i++) {
        that.import(that.files[i]);
      }
    });
  }
}

module.exports = Globber;