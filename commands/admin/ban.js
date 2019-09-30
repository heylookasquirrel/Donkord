module.exports.run = async (bot, message, args, string) =>{



      let id;
      if(args[0][0] == '<'){
        id = args[0].slice(0,-1).slice(2)
      }else{
        id = args[0]
      }

      let banee = message.guild.members.get(id);

      if(banee == undefined){
        message.channel.send("This isnt a vaild user to ban")
        return
      }

      try{
        banee.ban()
        message.channel.send("``` Successfully banned " + banee.displayName +"```")
      }catch(err){
        console.log(err)
        message.channel.send("Can't ban, permissions issue")
      }






}

module.exports.help = {

  name:"ban",
  helpText:"Bans a user from the server",
  catagory:"admin"

}
