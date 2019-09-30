const fs = require("fs");

function run(){
  const express = require('express');
  const app = express();
  const http = require('http').Server(app);
  const io = require('socket.io')(http);
  const bodyParser = require("body-parser");
  const bcrypt = require("bcryptjs")
  const mysql = require('mysql2');
  const path = require('path');
  const expressValidator = require("express-validator");

  //static dir for webGUI
  app.set('view engine','ejs');
  app.set('views', path.join(__dirname, 'views/'));
  app.use("/", express.static(path.join(__dirname, 'public')));
  app.use(bodyParser.urlencoded({limit: '50mb', extended: true, parameterLimit: 1000000}));
  app.use(bodyParser.json());
  app.use(expressValidator())


  let configTemplate = {}


  app.get('/', function(req, res){

    res.render("page1")

  })

  app.get('/page2', function(req, res){

    res.render("page2", {errors:null})

  })

  app.post('/page2', function(req, res){


    req.checkBody('dbserver', 'Server address is required').notEmpty();
    req.checkBody('dbname', 'Database name is required').notEmpty();
  	req.checkBody('dbuser', 'Username is required').notEmpty();
  	req.checkBody('dbpassword', 'Password is required').notEmpty();

    var errors = req.validationErrors();


    if(!req.validationErrors()){



        app.db = mysql.createConnection({
          host:req.body.dbserver,
          user:req.body.dbuser,
          database:req.body.dbname,
          password:req.body.dbpassword
        })


      app.db.query('SELECT 1 FROM settings LIMIT 1', (err , results, fields) =>{
        if(err && err.errno != 1146){
            //if the database has an error connecting
            errors = []
            let item = {}
            item.msg = err.errno + ": " + err.sqlMessage
            errors.push(item)

            res.render("page2",{ errors:errors})
          }else{

            //if tables dont exist, create them and start database
            //settings
            app.db.query('CREATE TABLE settings (name VARCHAR(255), enabled tinyint(1), id VARCHAR(255))', function(err, results, field){
              if(err){
                //if the table exists continue to Admin setup
                errors = [];
                let item = {}
                item.msg = err.errno + ": " + err.sqlMessage;
                errors.push(item)
                item = {}
                item.msg = "The database already has tables in it";
                errors.push(item)
                //Add to configTemplate
                configTemplate.server = req.body.dbserver,
                configTemplate.user =req.body.dbuser,
                configTemplate.name =req.body.dbname,
                configTemplate.password =req.body.dbpassword

                res.render("page4",{ errors:errors})
                return
              }else{
                //create entries for the database init
                app.db.query("INSERT INTO `settings`(`name`, `enabled`) VALUES (?,?)",
                ["WebGUI",false,"0"])
                app.db.query("INSERT INTO `settings`(`name`, `enabled`, `id`) VALUES (?,?,?)",
                ["MOTD",false,"0"])
                app.db.query("INSERT INTO `settings`(`name`, `enabled`, `id`) VALUES (?,?,?)",
                ["DirectMessageMOTD",true,"0"])
                app.db.query("INSERT INTO `settings`(`name`, `enabled`, `id`) VALUES (?,?,?)",
                ["LogJoined",false,"0"])


                //default messages
                app.db.query('CREATE TABLE messages (name VARCHAR(255), content varchar(2000))')
                app.db.query("INSERT INTO `messages`(`name`, `content`) VALUES (?,?)",
                ["guildMemberAdd","Placeholder text"])
                app.db.query("INSERT INTO `messages`(`name`, `content`) VALUES (?,?)",
                ["MOTD","Placeholder text"])
                app.db.query("INSERT INTO `messages`(`name`, `content`) VALUES (?,?)",
                ["guildMemberRemove","Placeholder text"])
                app.db.query("INSERT INTO `messages`(`name`, `content`) VALUES (?,?)",
                ["guildBanAdd","Placeholder text"])

                //plugins
                app.db.query('CREATE TABLE plugins (name VARCHAR(255), description VARCHAR(255), catagory VARCHAR(255), checksum VARCHAR(255), enabled tinyint(1))')

                //commands
                app.db.query('CREATE TABLE commands (name VARCHAR(255), description VARCHAR(255), catagory VARCHAR(255), checksum VARCHAR(255), enabled tinyint(1))')

                //users
                app.db.query('CREATE TABLE users (name VARCHAR(255), discordid VARCHAR(255), password VARCHAR(255), email VARCHAR(255), permissions int(1), `id` INT NOT NULL AUTO_INCREMENT , PRIMARY KEY (`id`))')

                //permissions
                app.db.query('CREATE TABLE permissions (groupid VARCHAR(500), guildid VARCHAR(500), command VARCHAR(500), enabled BOOLEAN NOT NULL)')

                //Add to configTemplate
                configTemplate.server = req.body.dbserver,
                configTemplate.user =req.body.dbuser,
                configTemplate.name =req.body.dbname,
                configTemplate.password =req.body.dbpassword
                //move on to confirm page redirect
                res.render("page3",{ errors:null})
              }

            })
          }
      })



    }
    else{
      res.render("page2",{ errors:errors})
    }




  })

  app.get('/page4', function(req, res){


    res.render("page4", {errors:null})

  })

  app.post('/page5', function(req, res){


    let email = req.body.email;
    let username = req.body.username;
    let password = req.body.password;
    let password2 = req.body.password2;
    let discordid = req.body.discordid;

    //validation

    req.checkBody('username', 'Name is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();
  	req.checkBody('email', 'Email is not valid').isEmail();
  	req.checkBody('username', 'Username is required').notEmpty();
  	req.checkBody('password', 'Password is required').notEmpty();
  	req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

    var errors = req.validationErrors();

    if(errors){
      res.render("page4",{
        errors:errors
      })
    }
    var newUser = {
      username: username,
      email: email,
      password: password,
      permissions: 2
    }

    newUser.discordid = discordid || null;

    app.createUser(newUser, user =>{
      app.db.query("INSERT INTO `users` (`name`, `password`, `email`, `permissions`, `discordid`) VALUES (?,?,?,?,?)",
      [user.username,user.password,user.email,user.permissions,user.discordid])
    })

    res.render("page5", {errors:null})

  })

  app.post('/page6', function(req, res){

    configTemplate.token = req.body.token;
    writeConfig(configTemplate)
    res.render("page6", {errors:null})

  })

  http.listen(3000, function(){
    console.log('Please go to http://localhost:3000');
  });

  app.createUser = (newUser, callback) =>{
    bcrypt.genSalt(10, function(err, salt) {
  	    bcrypt.hash(newUser.password, salt, function(err, hash) {
  	        newUser.password = hash;
  	        callback(newUser)
  	    });
  	});
  }

}

function writeConfig(configTemplate){

  let config = {
    webGUI:true
  }
  config.mysqluser = configTemplate.user
  config.mysqldb = configTemplate.name
  config.mysqlpassword = configTemplate.password
  config.mysqlserver = configTemplate.server
  config.token = configTemplate.token

  fs.writeFile("settings.json", JSON.stringify(config), 'utf8', function(){
    console.log("Settings file created!")
  })
}

function endInstall(){
  console.log("Install finished, Please restart the server")
  process.exit()
}

//
module.exports = {run}
