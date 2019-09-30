const web = require("../../webGUI.js")
const ds = require("../../main.js")
const uuidv3 = require('uuid/v3')
const MY_NAMESPACE = '6d52608f-1846-43a2-99eb-9467912f37b3';
const io = require("socket.io")(3001)
const settings = require("../../settings.json")

web.app.storage.roleSessions = {}

web.app.get('/roleAssign', function (req, res) {

    let id = req.query.usersession

    let session = web.app.storage.roleSessions[id]

    if(session == undefined || session == null){

      res.render("404")
      return;
    }

    res.render("roleAssign",{
        session:session,
        errors:false
    })



});

io.on('connection', function(socket){

  socket.on('select', data =>{

    let role = data.role;
    let sessionid = data.sessionid
    let session = web.app.storage.roleSessions[sessionid];
    let assign = ds.bot.guilds.get(session.guild.id).roles.get(role);

    //check for admin permissions
    if(assign.hasPermission('BAN_MEMBERS')){
      return;
    }
    if(assign.hasPermission('KICK_MEMBERS')){
      return;
    }
    if(assign.hasPermission('MANAGE_CHANNELS')){
      return;
    }
    if(assign.hasPermission('ADMINISTRATOR')){
      return;
    }
    if(assign.hasPermission('MANAGE_ROLES')){
      return;
    }
    if(assign.hasPermission('MANAGE_WEBHOOKS')){
      return;
    }
    if(assign.hasPermission('MANAGE_GUILD')){
      return;
    }
    if(assign.hasPermission('MANAGE_MESSAGES')){
      return;
    }

    ds.bot.guilds.get(session.guild.id).members.get(session.user.id).addRole(assign).catch(console.error);

  })


})

module.exports.run = async (bot, message, args) =>{


    let id = uuidv3(message.author.id, MY_NAMESPACE)
    let userSession = [{}];

    let user = {}
    user.id = message.author.id;
    user.username = message.author.username;

    let guild = {}
    guild.id = message.channel.guild.id;
    guild.roles = []
    message.channel.guild.roles.forEach( item => {
      let role = {}
      role.id = item.id;
      role.name = item.name;
      role.permissions = item.permissions;
      role.color = item.hexColor;

      //check for admin permissions
      if(item.hasPermission('BAN_MEMBERS')){
        return;
      }
      if(item.hasPermission('KICK_MEMBERS')){
        return;
      }
      if(item.hasPermission('MANAGE_CHANNELS')){
        return;
      }
      if(item.hasPermission('ADMINISTRATOR')){
        return;
      }
      if(item.hasPermission('MANAGE_ROLES')){
        return;
      }
      if(item.hasPermission('MANAGE_WEBHOOKS')){
        return;
      }
      if(item.hasPermission('MANAGE_GUILD')){
        return;
      }
      if(item.hasPermission('MANAGE_MESSAGES')){
        return;
      }
      if(item.name == "@everyone"){
        return
      }

      let hasRole = false
      message.guild.members.get(message.author.id).roles.forEach( has =>{
        if(has.id == item.id){
          hasRole = true;
          return
        }
      })
      if(hasRole){
        return
      }

      guild.roles.push(role);
    })



    web.app.storage.roleSessions[id] = {
      user: user,
      guild: guild
    }



    let hostname = settings.hostname + ":" + web.app.assignedPort
    let url = hostname + "/roleAssign" + "?usersession=" + id


      message.author.send("Click here to assign your roles! "+ url)
      .catch(() => message.reply("Please enable DMs to receive messages from me, ```You can change this by right clicking privacy settings on the server icon``` "));




}

module.exports.help = {

  name:"role",
  helpText:"assign roles",
  catagory:"rpcommand"

}
