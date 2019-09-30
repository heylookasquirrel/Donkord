const discord = require("discord.js");
const fs = require("fs");
const bot = new discord.Client({
  disableEveryone: true
})
let settings = {}
const path = require("path")
const prefix = "!"
const mysql = require('mysql2');
const checksum = require('checksum')

//check if bot is installed
function checkInstall(){

  let installExists = fs.lstatSync(path.join(__dirname, 'install')).isDirectory();
  let settingsExists = fs.existsSync(path.join(__dirname, 'settings.json'));
  if(installExists && settingsExists){
    console.log("Please delete the install folder for Security reasons.")
    settings = require("./settings.json")
    return false
  }else if(installExists && !settingsExists){
    return true;
  }else{
    settings = require("./settings.json")
    return false;
  }
}

function startInstall(){
  const installer = require("./install/install.js");
  installer.run()
}
function dbInit(){
  //try for a connection to the server, if not state an error, halt
  bot.db = mysql.createConnection({
    host:settings.mysqlhost,
    user:settings.mysqluser,
    database:settings.mysqldb,
    password:settings.mysqlpassword
  })

}

//gets files in an array, including sub dir
function getFiles(dir, _files){
  _files = _files || [];
  let files = fs.readdirSync(dir);
  files.forEach( element => {
    let name = dir + "/" + element;
    if(fs.statSync(name).isDirectory()){
      getFiles(name, _files);
    }else{

      _files.push(name);
    }
  })
  return _files
}

function init(){
  if(checkInstall()){
    startInstall()
    return
  }
  dbInit()
  bot.commands = new discord.Collection();

  //load files from commands folder
  var jsfiles = getFiles("./commands");
  jsfiles = jsfiles.filter(f => f.split(".").pop() === "js");
  if(jsfiles.length <= 0){
    console.log("No commands found in command folder")
  }else{
    console.log(`Loading ${jsfiles.length} commands!`)
  };

  jsfiles.forEach((f,i) =>{
    //loads each filename
    let props = require(`${f}`);
    console.log(`${i + 1}: ${f} Loaded`);
    props.checksum = checksum(f)
    //change these for how to load new commands
    bot.commands.set(props.help.name, props);
  })

  bot.updateCommands()

  if(settings.webGUI){
    bot.webGUI = require("./webGUI.js")
    console.log("loaded WebGUI")
  }
  
  bot.login(settings.token)

  bot.LogEngine = require("./logEngine.js");
  console.log("Log Engine Started")
  bot.MusicEngine = require("./musicEngine.js");
  console.log("Music Engine Started")
}

bot.on("ready", async function(){
  console.log(`Ready to go! Im ${bot.user.username}`);
});

bot.on("message", async function(message){

  //doesnt listen to other bots
  if(message.author.bot) return;

  //Direct message logic for later
  if(message.channel.type === "dm"){
    return
  }

  //splits the entire string into an array
  let msgArray = message.content.split(" ");
  //make each argment lowercase to avoid case sensitive commands
  msgArray.forEach( (element) => {
    element.toLowerCase()
  })
  //seperates command and arguments
  let command = msgArray[0];
  let args = msgArray.slice(1);
  let string = args.join(" ");

  //process commands
  let cmd = bot.commands.get(command.slice(prefix.length));
  //if(!commands.startsWith(prefix)) return;


  let correctPerm = false;
  let said = false;
  message.guild.members.get(message.author.id).roles.forEach( role =>{

      bot.db.query('SELECT * FROM `permissions` WHERE `groupid` = ?',
      [role.id], (err, res, fields) => {


        res.forEach( entry => {

          if(entry.enabled && command == prefix + entry.command){

            correctPerm = true;
          }
        })



        if(said) return //prevents loop going crazy
        if(!correctPerm) return
        if(cmd) cmd.run(bot, message, args, string)
        said = true; //prevents loop going crazy

      })


    })




})

bot.on("guildMemberAdd", async function(member){

  //Join logging in channel
  bot.db.query('SELECT * FROM `settings` WHERE `name` = "LogJoined"',
  (err, results, fields) => {
    if(results[0].enabled){
      let channelid = `${results[0].id}`
      bot.channels.get(channelid).send(
        `${member.guild.name}: ${member.user} has joined.`
      )
    }
  })


  //check if MOTD is enabled
  bot.db.query('SELECT enabled FROM `settings` WHERE `name` = "MOTD"',
  (err, results, fields) => {
    if(results[0].enabled){
      //grabs the message to send
      bot.db.query('SELECT content FROM `messages` WHERE `name` = "guildMemberAdd"',
      (err, results, fields) =>{
        let message = results[0].content;
        //finds the channel to send it to
        bot.db.query('SELECT id FROM `settings` WHERE `name` = "MOTD"',
        (err, results, fields) => {
          //turns id into string for discord.js to understand
          let channelid = `${results[0].id}`
          bot.channels.get(channelid).send(message)
        })
        //sends direct message if enabled
        bot.db.query('SELECT enabled FROM `settings` WHERE `name` = "DirectMessageMOTD"',
        (err, results, fields) => {
          if(results[0].enabled){
            member.send(message);
          }
        })
      })
    }
  })
})

bot.on("guildMemberRemove", async function(member){

  //Leave logging in channel
  bot.db.query('SELECT * FROM `settings` WHERE `name` = "LogJoined"',
  (err, results, fields) => {
    if(results[0].enabled){
      let channelid = `${results[0].id}`
      bot.channels.get(channelid).send(
        `${member.guild.name}: ${member.user} has left.`
      )
    }
  })

})

bot.on("guildBanAdd", async function(guild, user){

  //Ban logging in channel
  bot.db.query('SELECT * FROM `settings` WHERE `name` = "LogJoined"',
  (err, results, fields) => {
    if(results[0].enabled){

      let channelid = `${results[0].id}`
      bot.channels.get(channelid).send(
        `${guild.name} bans ${user.username}.`
      )
    }
  })

})

bot.on("guildBanRemove", async function(guild, user){
  //Ban logging in channel
  bot.db.query('SELECT * FROM `settings` WHERE `name` = "LogJoined"',
  (err, results, fields) => {
    console.log(results)
    if(results[0].enabled){
      let channelid = `${results[0].id}`
      bot.channels.get(channelid).send(
        `${guild.name} revokes ban on ${user.username}.`
      )
    }
  })
})

bot.updateCommands = function(){
  bot.commands.forEach( command => {
    bot.db.query('SELECT * FROM commands WHERE name = ?',
    [command.help.name],
    (err, results, fields) => {
      if(err) return;
      if(results.length == 0){
        bot.db.query('INSERT INTO `commands`(`name`, `description`, `catagory`, `checksum`, `enabled`) VALUES (?,?,?,?,?)',
        [command.help.name,command.help.helpText,command.help.catagory,command.checksum,false])
        return;
      }

      if(results[0].enabled){
        command.enabled = true;
      }

    })
  })
}

var jsfiles = getFiles("./commands");
module.exports = {jsfiles,bot}
init()
