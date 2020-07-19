function getTest(f) {
  const Assets = require('./game/Assets');
  var a = new Assets(__dirname);
  a.load().then(() => a.find("default").use().then(d => f(d).write('c:/users/Sean/Desktop/hi.png')));
}

module.exports=getTest;