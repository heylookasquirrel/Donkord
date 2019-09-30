module.exports.run = async (bot, message, args, string) =>{

  console.log("playing")
  bot.musicBot.dispatcher = bot.musicBot.connection.playFile("mlp.mp3");
  bot.musicBot.status.player = 1;//playing
  
}

module.exports.help = {

  name:"play",
  helpText:"TestTone",
  catagory:"Music"


}
