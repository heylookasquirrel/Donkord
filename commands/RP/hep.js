module.exports.run = async (bot, message, args) =>{

    console.log(`${message.author.id} hepped`);


    //just heps for some reason wtf
    message.channel.send(`*hep*`);


}

module.exports.help = {

  name:"hep",
  helpText:"Just heps",
  catagory:"rpcommand"

}
