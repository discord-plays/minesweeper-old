const url = require('url');
const path = require('path');
const express = require("express");
const Discord_OAuth_Client = require('discord-oauth2-api');
const anyBody = require('body/any');
const cookieParser = require('cookie-parser');
const { v4: uuidv4 } = require('uuid');

const www = path.join(__dirname,'public');
const app = express();
app.use(anyBody);
app.use(cookieParser());
app.use((req, res, next)=>{
  req.query = new url.URL(req.url,process.env.ADDRESS).searchParams;
  next()
});

function createId() {
  let id=uuidv4();
  while(sessions.hasOwnProperty(id)) id=uuidv4();
  return id;
}

function getFile(p) {
  return path.join(www,p);
}

var sessions={};
var users={};
var botData;
var bot;

const client = new Discord_OAuth_Client({
  clientID: process.env.OAUTH_ID,
  clientSecret: process.env.OAUTH_TOKEN,
  scopes: ['identify'],
  redirectURI: process.env.ADDRESS
});

var authorizeURL = 'https://discord.com/oauth2/authorize';

app.get("/", (req,res,...a)=>{
  res.render(getFile('index.ejs'),{
    minesweeper:bot,
    bot:botData
  });
});

app.use('/styles',express.static(path.join(www,'styles')));
app.use('/scripts',express.static(path.join(www,"scripts")));
app.use('/images',express.static(path.join(www,"images")));

function checkSession(req, res, callback) {
  if(sessions.hasOwnProperty(req.cookies.session)) {
    let mySession = sessions[req.cookies.session];
    if(!mySession.loadedData) {
      client.getUser(mySession.code).then(user => {
        sessions[req.cookies.session].user = user;
        callback(mySession);
      }).catch((e) => {
        console.log(e);
        res.status(500).send('Error: User details processing failed');
      });
    }
  } else {
    res.redirect('/login');
  }
}

app.get("/create", (req, res, ...a)=>{
  checkSession(req, res, mySession => {
    let userChannel = users.hasOwnProperty(mySession.user.id) ? users[mySession.user.id].channel : undefined;

    res.render(getFile('create.ejs'), {
      minesweeper: bot,
      bot: botData,
      user: {
        tag: mySession.user.tag,
        channel: userChannel
      },
      minedata: bot.getMinesLayered(),
      customboarddata: bot.getBoardsLayered()
    });
  })
});

app.get("/missions", (req,res,...a)=>{
  res.render(getFile('missions.ejs'),{
    minesweeper:bot,
    bot:botData
  });
});

app.get("/settings", (req,res,...a)=>{
  checkSession(req, res, mySession => {
    let userChannel = users.hasOwnProperty(mySession.user.id) ? users[mySession.user.id].channel : undefined;

    res.render(getFile('settings.ejs'), {
      minesweeper: bot,
      bot: botData,
      user: {
        tag: mySession.user.tag,
        channel: userChannel
      }
    })
  });
});

app.post("/create", express.json(), (req, res, ...a)=>{
  if(bot!=null) {
    let j = req.body;
    if(!j.hasOwnProperty("board")) return res.status(200).send(JSON.stringify({state:-1}));
    if(!j.hasOwnProperty("mines")) return res.status(200).send(JSON.stringify({state:-1}));

    checkSession(req, res, mySession => {
      let userChannel = users.hasOwnProperty(mySession.user.id) ? users[mySession.user.id].channel : undefined;

      if(userChannel == undefined) {
        res.status(200).send(JSON.stringify({state:3}));
        return;
      }

      try {
        bot.startGame(userChannel, mySession.user, j.customBoardId || "vanilla", j, null);
        res.status(200).send(JSON.stringify({
          state: 1
        }))
      } catch (err) {
        if (err.message.indexOf("Error: ") == 0) {
          res.status(200).send(JSON.stringify({
            state: 999,
            message: err.message.slice(7, err.message.length)
          }));
        } else {
          res.status(500).send('Internal server error');
          console.error(err);
        }
      }
    });
  } else {
    res.status(500).send('Internal server error');
  }
});

app.get("/login", (req,res,...a)=>{
  if(req.query.has('code')) {
    client.getAccessToken(req.query.get('code')).then(token => {
      let id=createId();
      sessions[id]={id:id,code:token.accessToken};
      res.cookie('session', id, {expires:new Date(Date.now()+10*365*24*60*60*1000)});
      res.redirect('/create');
    }).catch(()=>{
      res.status(500).send('Error: OAuth processing failed');
    });
  } else{
    res.redirect(`${authorizeURL}?client_id=${process.env.OAUTH_ID}&redirect_url=${encodeURIComponent(process.env.ADDRESS)}&response_type=code&scope=identify`);
  }
});

app.listen(process.env.PORT||3000,()=>{
  console.log(`Game generator server listening on port ${process.env.PORT||3000}`);
});

module.exports = {
  sendBotData: (data)=>{
    botData = data;
  },
  sendMinesweeperBot: (botClass)=>{
    bot = botClass;
  },
  updateUserLastChannel: (user, channel)=>{
    users[user.id] = {channel};
  }
};
