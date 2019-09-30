const ds = require("./main.js")
const fs = require("fs");

//create buffer for log to shoot to
let logBuffer = {
  meta: {
    users: {},
    userindex: [],
    servers: [],
    channels: {}
  },
  data: {}
}
let date = new Date();
let filename = "log" + date.getUTCMonth() + "-" + date.getUTCDate() + "-" + date.getUTCHours() + ".txt"

ds.bot.on("message", async function(message){
  let time = new Date().getTime() ;
  let object = { meta: {}, data: {}
  }


  let authorid = message.author.id
  let authorName = message.author.username
  let guildName = message.guild.name
  let channelid = message.channel.id
  let channelName = message.channel.name
  let messageContent = message.content
  let messageid = message.id

  //if the user is found set a flag to not push the user again
  let userFound = false;
  logBuffer.meta.userindex.forEach( id => {
    if(authorid == id){
      userFound = true;
    }
  })

  if(!userFound){
    logBuffer.meta.userindex.push(authorid)
  }

  logBuffer.meta.users[authorid] = {
    name: authorName
  }

  //if the server is found set a flag to not push the user again
  let serverFound = false;
  logBuffer.meta.servers.forEach( item => {
    if(item.name == guildName){
      serverFound = true;
    }
  })

  if(!serverFound){
    logBuffer.meta.servers.push({
      name: guildName,
      type: "SERVER"
    })
  }

  let serverIndex = 0;
  logBuffer.meta.servers.forEach( (server, index) =>{
    if(server.name == guildName){
      serverIndex = index;
    }
  })

  logBuffer.meta.channels[channelid] = {
        server: serverIndex,
        name: channelName
    }

  //find user messaging
  let userindex = 0
  logBuffer.meta.userindex.forEach( (id, index) => {
    if(id == authorid){
      userindex = index;
    }
  })

  let newMessageObject = [{}]

  newMessageObject[0][messageid] = {
    u: userindex,
    t: time,
    m: messageContent
  }

  if(logBuffer.data[channelid] == undefined){
    logBuffer.data[channelid] = newMessageObject[0]
    console.log("new Section made!")
    return;
  }

  let channelBuffer = {};
  channelBuffer[channelid] = logBuffer.data[channelid];

  let currentString = JSON.stringify(newMessageObject[0])
  currentString = currentString.slice(1,currentString.length-1);
  let savedString = JSON.stringify(channelBuffer[channelid])
  savedString = savedString.slice(1,savedString.length-1);
  savedString += `,`
  savedString += currentString;
  savedString += "}"


  channelBuffer[channelid] = JSON.parse("{" + savedString);

  logBuffer.data[channelid] = channelBuffer[channelid]


  //console.log(roughSizeOfObject(JSON.stringify(logBuffer)))


  fs.writeFile("logs/" + filename, JSON.stringify(logBuffer), function(err) {
    if(err) {
        return console.log(err);
    }
  });

})

function roughSizeOfObject( object ) {

    var objectList = [];
    var stack = [ object ];
    var bytes = 0;

    while ( stack.length ) {
        var value = stack.pop();

        if ( typeof value === 'boolean' ) {
            bytes += 4;
        }
        else if ( typeof value === 'string' ) {
            bytes += value.length * 2;
        }
        else if ( typeof value === 'number' ) {
            bytes += 8;
        }
        else if
        (
            typeof value === 'object'
            && objectList.indexOf( value ) === -1
        )
        {
            objectList.push( value );

            for( var i in value ) {
                stack.push( value[ i ] );
            }
        }
    }
    return bytes;
}
