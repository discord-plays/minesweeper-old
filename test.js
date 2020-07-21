function getTest(f) {
  const Assets = require('./game/Assets');
  var a = new Assets(__dirname);
  a.load().then(() => a.find("default").use().then(d => f(d).write('output_of_test.png')));
}

module.exports=getTest;