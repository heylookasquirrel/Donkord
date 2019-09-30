const { createCanvas, loadImage } = require('canvas')
const canvas = createCanvas(282, 343)
const ctx = canvas.getContext('2d')

module.exports.run = async (bot, message, args, string) =>{

  message.delete(1);

  loadImage('resources/img/noot.png').then((image) => {
      ctx.drawImage(image, 0, 0, image.width, image.height);
 
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


	canvas.toBuffer((err, buf) => {
	  if (err) throw err // encoding failed
	  // buf is PNG-encoded image

	  message.channel.send({file:buf})
	  ctx.clearRect(0, 0, 300, 400);
	})


  })

  }
module.exports.help = {

  //name of command
  name:"nootsign",
  helpText:"Noot holds a sign with your text",
  catagory:"memecommand"

}
