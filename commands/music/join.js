module.exports.run = async (bot, message, args) =>{


      if(message.member.voiceChannel.joinable){

          message.member.voiceChannel.join()
          .then( connection => {
            //make connection accessible to other commands
            bot.musicBot.connection = connection;
            bot.musicBot.channelid = message.member.voiceChannel.id;


          }).catch(console.log);



      }else{
        message.channel.send("You must be in a voice channel!")

      }




}

module.exports.help = {

  name:"join",
  helpText:"Activates Music",
  catagory:"Music"

}
