const { createCanvas, loadImage } = require('canvas')
const canvas = createCanvas(356, 380)
const ctx = canvas.getContext('2d')

module.exports.run = async (bot, message, args, string) =>{



    message.delete(1);

    loadImage('resources/img/nootsmug.png').then((image) => {
      ctx.drawImage(image, 0, 0, image.width, image.height);

      let xSize = 130;
      let ySize = 69;
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

      ctx.rotate(348*Math.PI/180)
      lines.forEach( (item, i) => {
        console.log(item);
        ctx.fillText(item,6,154+font+(font*i+1) )
      })


    	canvas.toBuffer((err, buf) => {
    	  if (err) throw err // encoding failed
    	  // buf is PNG-encoded image

    	  message.channel.send({file:buf})
    	  ctx.clearRect(0, 0, 400, 400);
    	})
    })
}

module.exports.help = {

  //name of command
  name:"nootsmug",
  helpText:"Noot holds a sign with your text",
  catagory:"memecommand"

}
