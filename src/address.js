const url = require('url');

module.exports = {
  login: new url.URL('/login', process.env.ADDRESS),
  create: new url.URL('/create',process.env.ADDRESS),
  missions: new url.URL('/missions',process.env.ADDRESS)
};
