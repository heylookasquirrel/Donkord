const web = require("../webGUI.js")
const ds = require("../main.js")




web.app.get('/settings/permissions', web.app.ensureAuthenticated, function(req, res){

  ds.bot.updateCommands()

  let guilds = ds.bot.guilds.array()
  let guildinfo = []

  guilds.forEach((guild, index )=> {

    guildinfo.push({
      name: guild.name,
      id: guild.id,
      icon: guild.iconURL,
      roles: [],
      users: []
    })
  })

      res.render("settingsPermissions",{
        guilds: guildinfo
      })

})


web.app.post('/settings/permissions', web.app.ensureAuthenticated, function(req, res){

  let update = []

  Object.keys(req.body).forEach(function(key) {

    let value = req.body[key]
    let buffer = key.split('"')
    let location = {
      command: buffer[1],
      role: buffer[3],
      server: buffer[5]
    }

    if(Array.isArray(req.body[key])){

      location.enabled = 1;
    }
    else{

      location.enabled = 0;
    }
    update.push(location)

  })

  update.forEach( cmd => {


    ds.bot.db.query("SELECT `groupid`, `guildid`, `command`, `enabled` FROM `permissions` WHERE `groupid` = ?",
    [cmd.role], (err, results, fields) =>{

      if(results.length == 0){
        ds.bot.db.query("INSERT INTO `permissions`(`groupid`, `guildid`, `command`, `enabled`) VALUES (?,?,?,?)",
        [cmd.role,cmd.server,cmd.command,cmd.enabled])
      }else{
        ds.bot.db.query("UPDATE `permissions` SET `enabled` = ? WHERE `groupid` = ? AND `command` = ? ",
        [cmd.enabled,cmd.role,cmd.command])
      }
    })



  })

  let guilds = ds.bot.guilds.array()
  let guildinfo = []


  guilds.forEach((guild, index )=> {

    guildinfo.push({
      name: guild.name,
      id: guild.id,
      icon: guild.iconURL,
      roles: [],
      users: []
    })
  })

      res.render("settingsPermissions",{
        guilds: guildinfo
      })



})
