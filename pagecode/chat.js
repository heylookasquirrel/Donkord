// const web = require("../webGUI.js")
// const ds = require("../main.js")
//
// function unixTime(time){
//   var timestamp = time;
//   var date = new Date(timestamp);
//
//   var year = date.getFullYear();
//   var month = date.getMonth() + 1;
//   var day = date.getDate();
//   var hours = date.getHours();
//   var minutes = date.getMinutes();
//   var seconds = date.getSeconds();
//
//   return year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds
// }
//
// ds.bot.on("message", async function(message){
//
//
//
//   let sendBuffer = {
//     content: message.content,
//     author: message.author.username,
//     avatar: message.author.avatarURL,
//     channelName: message.channel.name,
//     channelId: message.channel.id,
//     guild: message.channel.guild.name,
//     guildId: message.channel.guild.id,
//     attachments: message.attachments,
//     memberColor: message.member.guild.roles.get(message.member._roles[0]).color,
//     timestamp: unixTime(message.createdTimestamp)
//   }
//
//   web.io.emit("chat", sendBuffer )
//
//
// })
//
// web.app.get('/chat', function(req, res){
//
//     res.render("chat", {
//     })
//
// })
