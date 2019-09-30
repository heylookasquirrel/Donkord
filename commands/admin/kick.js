module.exports.run = async (bot, message, args, string) =>{



      let id;
      if(args[0][0] == '<'){
        id = args[0].slice(0,-1).slice(2)
      }else{
        id = args[0]
      }

      let kickee = message.guild.members.get(id);

      if(kickee == undefined){
        message.channel.send("This isnt a vaild user to kick")
        return
      }

      try{
        kickee.kick()
        message.channel.send("``` Successfully kicked " + kickee.displayName +"```")
      }catch(err){
        message.channel.send("Can't kick, permissions issue")
      }






}

module.exports.help = {

  name:"kick",
  helpText:"Kicks a user from the server",
  catagory:"admin"

}
