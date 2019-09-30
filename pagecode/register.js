const web = require("../webGUI.js")
const ds = require("../main.js")


web.app.get('/register', function(req, res){

  res.render("register",{
    errors:false
  })

})

web.app.post('/register', function(req, res){

  let email = req.body.email;
  let username = req.body.username;
  let password = req.body.password;
  let password2 = req.body.password2;

  //validation

  req.checkBody('username', 'Name is required').notEmpty();
  req.checkBody('email', 'Email is required').notEmpty();
	req.checkBody('email', 'Email is not valid').isEmail();
	req.checkBody('username', 'Username is required').notEmpty();
	req.checkBody('password', 'Password is required').notEmpty();
	req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

  var errors = req.validationErrors();

  ds.bot.db.query('SELECT `name` FROM `users` WHERE `name` = ?',
  [username,username], (err, results, fields) =>{
    if(results == undefined){
      errors == true;
    }

    if(errors){

      res.render("register",{
        errors:errors
      })

    }else {
      var newUser = {
        username: username,
        email: email,
        password: password,
        permissions: 0
      }

      web.app.createUser(newUser, user =>{
        ds.bot.db.query("INSERT INTO `users` (`name`, `password`, `email`, `permissions`) VALUES (?,?,?,?)",
        [user.username,user.password,user.email,user.permissions])
      })


      res.render("login")
    }
  })





})
