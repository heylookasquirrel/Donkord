module.exports.run = async (bot, message, args, string) =>{

    if(bot.musicBot.status.player == 1){
        bot.musicBot.dispatcher.pause();
        bot.musicBot.status.player = 2 //paused
    }else if(bot.musicBot.status.player == 2){
        bot.musicBot.dispatcher.resume();
        bot.musicBot.status.player = 1 //playing
    }else{
        bot.message.send("REEE PLAY SOMETHING")
    }

}

module.exports.help = {

  name:"pause",
  helpText:"TestTone",
  catagory:"Music"


}
