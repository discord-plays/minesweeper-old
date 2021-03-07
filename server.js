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
  res.render(getFile('index.ejs'),{bot:botData});
});

app.use('/styles',express.static(path.join(www,'styles')));
app.use('/scripts',express.static(path.join(www,"scripts")));
app.use('/images',express.static(path.join(www,"images")));

app.get("/create", (req,res,...a)=>{
  if(sessions.hasOwnProperty(req.cookies.session)) {
    let mySession = sessions[req.cookies.session];
    client.getUser(mySession.code).then(user => {
      sessions[req.cookies.session].channel = users.hasOwnProperty(user.id)?users[user.id].channel:undefined;
      res.render(getFile('create.ejs'),{
        bot:botData,
        user:{
          tag:user.tag,
          channel:(users.hasOwnProperty(user.id)?users[user.id].channel:undefined)
        }
      });
    }).catch((e)=>{
      console.log(e);
      res.status(500).send('Error: User details processing failed');
    });
  } else {
    res.redirect('/login');
  }
});

app.post("/create", express.json(), (req,res,...a)=>{
  if(bot!=null) {
    let j = req.body;
    if(!j.hasOwnProperty("board")) return res.status(200).send(JSON.stringify({state:-1}));
    if(!j.hasOwnProperty("mines")) return res.status(200).send(JSON.stringify({state:-1}));

    if(sessions.hasOwnProperty(req.cookies.session)) {
      let mySession = sessions[req.cookies.session];
      if(mySession.channel!=undefined) {
        try {
          bot.startGame(mySession.channel,j);
          res.status(200).send(JSON.stringify({state:1}))
        } catch(err) {
          if (err.message.indexOf("Error: ") == 0) {
            res.status(200).send(JSON.stringify({state:999,message:err.message.slice(7, err.message.length)}));
          } else {
            res.status(500).send('Internal server error');
            console.error(err);
          }
        }
      } else {
        res.status(200).send(JSON.stringify({state:4}))
      }
    }
  } else {
    res.status(500).send('Internal server error');
  }
});

app.get("/login", (req,res,...a)=>{
  if(req.query.has('code')) {
    client.getAccessToken(req.query.get('code')).then(token => {
      let id=createId();
      sessions[id]={id:id,code:token.accessToken};
      res.cookie('session', id);
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
