module.exports.run = async (bot, message, args, string) =>{

  bot.musicBot.dispatcher.end("Ended Gracefully")
  message.member.voiceChannel.leave()
  bot.musicBot.channelid = 0

}

module.exports.help = {

  name:"stop",
  helpText:"TestTone",
  catagory:"Music"


}
