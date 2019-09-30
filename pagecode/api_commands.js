const web = require("../webGUI.js")
const ds = require("../main.js")



web.app.get('/commands.json', function(req, res){


    let commands = []
    let permissions = []
    ds.bot.db.query('SELECT * FROM `commands` WHERE 1',
    (err, results, fields) =>{
      if(err)return;


        commands = results

        ds.bot.db.query("SELECT `groupid`, `guildid`, `command`, `enabled` FROM `permissions` WHERE 1",
        (err, results, fields) =>{
          results.forEach( result =>{

            permissions[result.groupid + " " + result.command] = {
              guildid: result.guildid,
              command: result.command,
              enabled: result.enabled
            }

          })


          let guilds = JSON.parse(grabGuildlist())

          let meta = {
            commands: {

            },
            servers:{}
          }

          commands.forEach( (entry, index) => {
           meta.commands[entry.name] = {
             description: entry.description,
             catagory: entry.catagory,
             checksum: entry.checksum,
             globalEnabled: entry.enabled
           }
          })

          guilds.forEach( (entry, index) =>{

            meta.servers[entry.id] = {
              name: entry.name,
              roles: entry.roles,
              color: entry.color
            }




            meta.servers[entry.id].roles.forEach( role =>{
              let enabled = []

              commands.forEach( cmd => {

                let check = role.id + " " + cmd.name

                try{
                  if(permissions[check].enabled){
                    enabled.push(cmd.name)
                  }
                }catch(err){
                  return
                }



              })

              role.enabled = enabled

            })

          })

          res.json(meta)




        })





    })

})


function grabGuildlist(){
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


    return JSON.stringify(guildinfo)

}
