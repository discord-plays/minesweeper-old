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

app.get("/create", (req,res,...a)=>{
  if(sessions.hasOwnProperty(req.cookies.session)) {
    let mySession = sessions[req.cookies.session];
    client.getUser(mySession.code).then(user => {
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

app.post("/create", (req,res,...a)=>{
  if(bot!=null) {
    res.send('Posting a create message',req.body);
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
  sendMinesweeperBot: (bot)=>{
    bot = bot;
  },
  updateUserLastChannel: (user, channel)=>{
    users[user.id] = {channel};
  }
};
