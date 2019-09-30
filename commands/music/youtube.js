const youtube = require('ytdl-core');
const https = require('https')
module.exports.run = async (bot, message, args, string) =>{


  if(bot.musicBot.channelid == 0){
    message.channel.send("I'm not even in your channel, please ask me to join.")
  }
  if(args[0] == undefined) return;
  bot.musicBot.dispatcher = 0; //clear buffer

    let apiKey = "AIzaSyCNgRWO7eWaBDYpPJh9DvTwvnf-E6er4Sc"
    let videoid = args[0].slice(32)
    let url = "https://www.googleapis.com/youtube/v3/videos?key=" + apiKey + "&part=snippet&id=" + videoid

    console.log(url)
    //get youtube info{}
    https.get(url, function(res){
          var body = "";

          res.on('data', function(chunk){
              body += chunk;
          });

          res.on('end', function(){
              var info = JSON.parse(body);
              console.log(info)

              bot.musicBot.cmds.play(
                {
                      title: info.items[0].snippet.title,
                      artist:  info.items[0].snippet.channelTitle,
                      path:  args[0],
                      type: "youtube"
                }
              )


                          bot.musicBot.dispatcher.setBitrate('auto')
                          bot.musicBot.status.player = 1;//playing
                          console.log("Youtube Playing")
            })



          })

}

module.exports.help = {

  name:"youtube",
  helpText:"TestTone",
  catagory:"Music"


}
