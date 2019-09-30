const ds = require("./main.js")
const web = require("./webGUI.js")
const fs = require('fs');
const youtube = require('ytdl-core');

ds.bot.musicBot = {
  cmds: {},
  joined: false,
  channelid: 0,
  connection: 0,
  nicercast: 0,
  playlist: [],
  dispatcher: 0,
  status: {
    title: "empty",
    player: 0,
    playlist: 0,
    position: 0,
    volume: 1
  },
  nowPlaying: {
    title: "Nothing Loaded",
    artist: ""
  }

}

web.io.on('connection', function(socket){
  console.log('a user connected');


  socket.on('play', data => {

    ds.bot.musicBot.cmds.play(data)


  })

  socket.on("playlistPlay", data => {


    ds.bot.musicBot.cmds.play(
      ds.bot.musicBot.playlist[data], 1)
      console.log("playlistPlay: " + data)
    ds.bot.musicBot.status.position = data;

  })

  socket.on('pause', data => {

    if(ds.bot.musicBot.status.player == 1){
        ds.bot.musicBot.dispatcher.pause();
        ds.bot.musicBot.status.player = 2 //paused
    }else if(ds.bot.musicBot.status.player == 2){
        ds.bot.musicBot.dispatcher.resume();
        ds.bot.musicBot.status.player = 1 //playing
    }else{
      return
    }

    let status = ds.bot.musicBot.nowPlaying;
    status.status = ds.bot.musicBot.status.player;
    socket.emit("nowPlayingData", status)

  })

  socket.on('stop', data => {

    ds.bot.voiceConnections.array().forEach( con => {
      con.disconnect()
    })
    ds.bot.musicBot.channelid = 0

    let status = ds.bot.musicBot.nowPlaying;
    status.status = 0;
    socket.emit("nowPlayingData", status)

  })

  socket.on('playlistAdd', data => {

    ds.bot.musicBot.playlist.push(data)

  })

  socket.on('playlistQuery', data => {

    let sent = ds.bot.musicBot.playlist;
    socket.emit("playlistData", ds.bot.musicBot.playlist)

  })

  socket.on('nowPlaying', data => {

    let status = ds.bot.musicBot.nowPlaying;
    status.status = ds.bot.musicBot.status.player;
    socket.emit("nowPlayingData", status)

  })

  socket.on("volume", data =>{
    if(ds.bot.musicBot.status.player == 0){
      return;
    }
    ds.bot.musicBot.status.volume = data;
    ds.bot.musicBot.dispatcher.setVolume(data)
  })

  socket.on("reset", data =>{

    try{
      if(ds.bot.musicBot.channelid == 0) return
      ds.bot.voiceConnections.array().forEach( con => {
        con.disconnect()
        ds.bot.musicBot.status.player = 0 // stopped
      })

      ds.bot.channels.get(ds.bot.musicBot.channelid).join()
        .then( connection => {
          console.log("I joined the voice channel");

          //make connection accessible to other commands
          ds.bot.musicBot.connection = connection;


      }).catch(console.log);
    }catch(err){
      return;
    }


  })




});



//now playing api

ds.bot.musicBot.cmds.play = function(song, playlist){

  if( typeof ds.bot.musicBot.dispatcher.removeAllListeners !== "undefined"){
    ds.bot.musicBot.dispatcher.removeAllListeners()
  }



  if(ds.bot.musicBot.channelid == 0) return


  if(song.path.length > 0 ){

    if(song.type == "local"){
      ds.bot.musicBot.dispatcher = 0; //clear buffer
      ds.bot.musicBot.dispatcher = ds.bot.musicBot.connection.playFile(song.path);
      ds.bot.musicBot.dispatcher.setBitrate('auto')
      ds.bot.musicBot.nowPlaying = song;
      ds.bot.musicBot.status.player = 1;//playing

    }else if(song.type == "youtube"){

      ds.bot.musicBot.dispatcher = 0; //clear buffer
      ds.bot.musicBot.dispatcher = ds.bot.musicBot.connection.playStream(
        youtube(song.path, { audioonly: true })
      )
      ds.bot.musicBot.dispatcher.setBitrate('auto')
      ds.bot.musicBot.nowPlaying = song;
      ds.bot.musicBot.status.player = 1;//playing

    }
    ds.bot.musicBot.dispatcher.setVolume(ds.bot.musicBot.status.volume)
    let status = ds.bot.musicBot.nowPlaying;
    status.status = ds.bot.musicBot.status.player;
    web.io.sockets.emit("nowPlayingData", status)

  }else{
    return
  }

  ds.bot.musicBot.dispatcher.on('error', e => {
    // Catch any errors that may arise
    console.log(e);
  });


  ds.bot.musicBot.dispatcher.on('end', () => {

    if(playlist == 1){


      ds.bot.musicBot.status.position += 1




      if(ds.bot.musicBot.status.position > ds.bot.musicBot.playlist.length){
        web.io.sockets.emit("nowPlayingData",
          {
                title: "Playlist Ended",
                artist:  "",
                path: "",
                type: "",
                status: 0
          })
          return
          ds.bot.musicBot.status.position = 0
      }
      try{
        ds.bot.musicBot.cmds.play(
          ds.bot.musicBot.playlist[ds.bot.musicBot.status.position],1)
      }catch(err){

        web.io.sockets.emit("nowPlayingData",
          {
                title: "Playlist Ended",
                artist:  "",
                path: "",
                type: "",
                status: 0
          })

        ds.bot.musicBot.status.position = 0
        return;
      }


    }
  })


}
