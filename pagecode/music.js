const web = require("../webGUI.js")
const ds = require("../main.js")
const fs = require("fs")
const mm = require("music-metadata")
const util = require('util')

let songs = []

function updateSongs(){
  songs = []

  let mp3files = getFiles("music");
  mp3files = mp3files.filter(f => f.split(".").pop() === "mp3");
  if(mp3files.length <= 0){
    console.log("No songs found")
  }else{
    console.log(`Loaded ${mp3files.length} local songs!`)
  };

  mp3files.forEach((f,i) =>{

    mm.parseFile(f, {native: true})
      .then(function (metadata) {
        let info = metadata


        let title = metadata.common.title || f.slice(6);
        let artist = metadata.common.artist || "Unknown";
        let path = f;
        let type = "local"

        songs.push({
          title: title,
          artist: artist,
          path: path,
          type: type

        })

      })
      .catch(function (err) {
        console.error(err.message);
      });


  })

}

updateSongs()

web.app.post('/music', web.app.ensureAuthenticated, function(req, res){

      res.render("music",{

      })

})

web.app.get('/music', web.app.ensureAuthenticated, async function(req, res){



      res.render("music",{
          songs:songs
      })

})


function getFiles(dir, _files){
  _files = _files || [];
  let files = fs.readdirSync(dir);
  files.forEach( element => {
    let name = dir + "/" + element;
    if(fs.statSync(name).isDirectory()){
      getFiles(name, _files);
    }else{

      _files.push(name);
    }
  })
  return _files
}
