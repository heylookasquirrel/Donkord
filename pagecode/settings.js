const web = require("../webGUI.js")
const ds = require("../main.js")


web.app.post('/settings/general', web.app.ensureAuthenticated, web.app.isAdmin, function(req, res){

    console.log(req.body)


    let motdEnabled = false;
    let motdID = parseInt(req.body.motdID) || 0;
    let motdDirectMessage = false;
    let motdMessage = req.body.motd || "";
    let logJoin = false;
    let logID = parseInt(req.body.joinID) || 0;
    let memberAdd = req.body.memberJoin || "";
    let memberLeave = req.body.memberLeave || "";
    let memberBan = req.body.memberBanned || "";


    if(req.body.motdDirectMessage == 'on'){
      motdDirectMessage = true;
    }

    if(req.body.motdEnabled == 'on'){
      motdEnabled = true;
    }

    if(req.body.LogJoin == 'on'){
      logJoin = true;
    }

    //queries
    ds.bot.db.query("UPDATE `settings` SET `enabled` = ?, `id` = ? WHERE `name` = ?",
    [motdEnabled,motdID,"MOTD"])

    ds.bot.db.query("UPDATE `settings` SET `enabled` = ? WHERE `name` = ?",
    [motdDirectMessage,"DirectMessageMOTD"])

    ds.bot.db.query("UPDATE `messages` SET `content` = ? WHERE `name` = ?",
    [motdMessage,"MOTD"])

    ds.bot.db.query("UPDATE `settings` SET `enabled` = ?, `id` = ? WHERE `name` = ?",
    [logJoin,logID,"LogJoined"])

    ds.bot.db.query("UPDATE `messages` SET `content` = ? WHERE `name` = ?",
    [memberAdd,"guildMemberAdd"])

    ds.bot.db.query("UPDATE `messages` SET `content` = ? WHERE `name` = ?",
    [memberLeave,"guildMemberRemove"])

    ds.bot.db.query("UPDATE `messages` SET `content` = ? WHERE `name` = ?",
    [memberBan,"guildBanAdd"])


    ds.bot.db.query("SELECT `name`, `content` FROM `messages` WHERE 1", (err, results, fields) => {
      console.log(results)
      results.forEach( item => {

        if(item.name == "guildMemberAdd"){
          memberAdd = item.content
        }

        if(item.name == "guildMemberRemove"){
          memberLeave = item.content
        }

        if(item.name == "guildBanAdd"){
          memberBan = item.content
        }

        if(item.name == "MOTD"){
          motdMessage = item.content
        }

      })


      ds.bot.db.query("SELECT * FROM `settings` WHERE 1", (err, results, fields) => {
        console.log(results)

        results.forEach( item => {

          if(item.name == "MOTD"){
            motdEnabled = item.enabled
            motdID = item.id
          }

          if(item.name == "DirectMessageMOTD"){
            motdDirectMessage = item.enabled
          }

          if(item.name == "LogJoined"){
            logJoin = item.enabled
            logID = item.id
          }

        })



        res.render("settingsGeneral",{
          motdEnabled: motdEnabled,
          motdID: motdID,
          motdDirectMessage: motdDirectMessage,
          motd: motdMessage,
          LogJoin: logJoin,
          joinID: logID,
          memberJoin: memberAdd,
          memberLeave: memberLeave,
          memberBanned: memberBan,
          updated: true
        })


      })




    })

})

web.app.get('/settings/general', web.app.ensureAuthenticated, web.app.isAdmin, function(req, res){

  let motdEnabled = false;
  let motdID = 0;
  let motdDirectMessage = false;
  let motdMessage = "";
  let logJoin = false;
  let logID =  0;
  let memberAdd = "";
  let memberLeave = "";
  let memberBan = "";

  ds.bot.db.query("SELECT `name`, `content` FROM `messages` WHERE 1", (err, results, fields) => {
    console.log(results)
    results.forEach( item => {

      if(item.name == "guildMemberAdd"){
        memberAdd = item.content
      }

      if(item.name == "guildMemberRemove"){
        memberLeave = item.content
      }

      if(item.name == "guildBanAdd"){
        memberBan = item.content
      }

      if(item.name == "MOTD"){
        motdMessage = item.content
      }

    })


    ds.bot.db.query("SELECT * FROM `settings` WHERE 1", (err, results, fields) => {
      console.log(results)

      results.forEach( item => {

        if(item.name == "MOTD"){
          motdEnabled = item.enabled
          motdID = item.id
        }

        if(item.name == "DirectMessageMOTD"){
          motdDirectMessage = item.enabled
        }

        if(item.name == "LogJoined"){
          logJoin = item.enabled
          logID = item.id
        }

      })



      res.render("settingsGeneral",{
        motdEnabled: motdEnabled,
        motdID: motdID,
        motdDirectMessage: motdDirectMessage,
        motd: motdMessage,
        LogJoin: logJoin,
        joinID: logID,
        memberJoin: memberAdd,
        memberLeave: memberLeave,
        memberBanned: memberBan,
        updated: false
      })


    })




  })



})
