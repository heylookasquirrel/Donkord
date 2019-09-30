const web = require("../webGUI.js")
const ds = require("../main.js")




web.app.get('/guildlist.json', function(req, res){

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

    guild.roles.forEach( role => {
      guildinfo[index].roles.push({
        name:role.name,
        id: role.id,
        color: role.color
      })
    })

    guild.members.forEach( member => {

      guildinfo[index].users.push({
        name:member.user.username,
        avatar: member.user.avatarURL,
        id: member.id,
        roles: [],
      })


      member.roles.forEach( (mRole) =>{
        guildinfo[index].users[guildinfo[index].users.length-1].roles.push({
          name:mRole.name,
          id:mRole.id,
          color:mRole.color
        })
      })

    })

  })

  if(!req.query.server){
    res.json(guildinfo)
  }else{
    res.json(guildinfo[req.query.server]);
  }

})
