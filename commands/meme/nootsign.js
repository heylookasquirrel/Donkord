let canvaslib = require("canvas-prebuilt");
let fs = require("fs")

module.exports.run = async (bot, message, args, string) =>{

  message.delete(1);
  Image = canvaslib.Image;
  canvas = new canvaslib(282, 343);
  ctx = canvas.getContext('2d');
  var img = new canvaslib.Image;

  var out = fs.createWriteStream('out.png');

  fs.readFile('resources/img/noot.png', function(err, image){
  if (err) throw err;
  img.src = image;
  });

  img.onload = async function(){
      ctx.drawImage(img, 0, 0, img.width, img.height);

      let xSize = 90;
      let ySize = 70;
      let font = 24;
      ctx.font=`${font}px Arial`;
      let lines = ['']
      let stringBuffer = "";
      args.forEach( item => {

        ctx.font=`${font}px Arial`;
        let testText = stringBuffer + item
        if(ctx.measureText(testText).width > xSize){
          stringBuffer = "";
          lines.push("")
          font = font - 2
        }

        stringBuffer += item;
        stringBuffer += " "
        lines[lines.length-1] = stringBuffer;

      })

      ctx.rotate(354*Math.PI/180)
      lines.forEach( (item, i) => {
        console.log(item);
        ctx.fillText(item,55,150+font+(font*i+1) )
      })


      var stream = canvas.pngStream();

      stream.on('data', function(chunk){
         out.write(chunk);
      })

      stream.on('end', function(){
         message.channel.send({file:'out.png'})

      })
  }

}

module.exports.help = {

  //name of command
  name:"nootsign",
  helpText:"Noot holds a sign with your text",
  catagory:"memecommand"

}