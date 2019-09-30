const web = require("../webGUI.js")
const ds = require("../main.js")


web.app.post('/settings/manage/user', web.app.ensureAuthenticated, web.app.isAdmin, function (req, res) {



	let id = req.body.id
	let email = req.body.email;
	let permissions = parseInt(req.body.permissions);
  let username = req.body.username;
	let discordid = req.body.discordid;
  let password = req.body.password;
  let password2 = req.body.password2;


	//check if fields are empty
	let passwordEmpty = false, discordEmpty = false;
	if(password == "" || password == undefined){
		passwordEmpty = true
	}
	if(discordid == "" || discordid == undefined){
		discordEmpty = true
	}

	//validation check of fields
	if(!passwordEmpty){
		req.checkBody('password', 'Password is required').notEmpty();
		req.checkBody('password2', 'Passwords do not match').equals(req.body.password);
	}
	if(!discordEmpty){
		req.checkBody({ 'discordid': {optional:
			{options:
				{ checkFalsy: true }
			},isDecimal: {errorMessage: 'DiscordID not valid format'}}})
	}

  req.checkBody('email', 'Email is required').notEmpty();
	req.checkBody('email', 'Email is not valid').isEmail();
	req.checkBody('username', 'Username is required').notEmpty();


	var errors = req.validationErrors();

	if(errors){

		ds.bot.db.query("SELECT `id`, `email`, `name`, `discordid`, `permissions` FROM `users` WHERE `id` = ?", [id], (err, results, fields) => {
			let user = {}
	    results.forEach( item => {
				user.id = item.id || 0;
				user.email = item.email || 0;
				user.username = item.name || "error"
				user.discordid = item.discordid || "Not Assigned";
				user.permissions = item.permissions || 0;
			})
			res.render("manageUsers",{
				errors:errors,
				user:user
			})
		})

	}else{

		var newUser = {
			username: username,
			email: email,
			permissions: permissions
		}



		if(!passwordEmpty && discordEmpty){
			//Password entered, Discord ID empty
			newUser.password = password;
			web.app.createUser(newUser, user =>{
				ds.bot.db.query("UPDATE `users` SET `name` = ?,  `email` = ?, `permissions` = ?, `password` = ? WHERE `id` = ?",
				[user.username,user.email,user.permissions,user.password,id])
			})
			res.redirect('/settings/users');
			return
		}else if(passwordEmpty && !discordEmpty ){
			//No password change, discord id change
			newUser.discordid = discordid

			ds.bot.db.query("UPDATE `users` SET `name` = ?,  `email` = ?, `permissions` = ?, `discordid` = ? WHERE `id` = ?",
			[newUser.username,newUser.email,newUser.permissions,newUser.discordid,id])
			res.redirect('/settings/users');
			return
		}else if(!discordEmpty && !passwordEmpty){
			//change both password and discordid
			newUser.password = password;
			newUser.discordid = discordid
			web.app.createUser(newUser, user =>{
				ds.bot.db.query("UPDATE `users` SET `name` = ?, `email` = ?, `permissions` = ?, `password` = ?, `discordid` = ? WHERE `id` = ?",
				[user.username,user.email,user.permissions,user.password,user.discordid,id])
			})
			res.redirect('/settings/users');
			return
		}else{
			ds.bot.db.query("UPDATE `users` SET `name` = ?,  `email` = ?, `permissions` = ? WHERE `id` = ?",
			[newUser.username,newUser.password,newUser.email,newUser.permissions,id])
			res.redirect('/settings/users');
		}

	}
})


// Temporary change
// web.app.ensureAuthenticated, web.app.isAdmin,
web.app.get('/settings/manage/user', web.app.ensureAuthenticated, web.app.isAdmin,  function(req, res){

	let id = req.query.id

	ds.bot.db.query("SELECT `id`, `email`, `name`, `discordid`, `permissions` FROM `users` WHERE `id` = ?", [id], (err, results, fields) => {
		let user = {}
    results.forEach( item => {
			user.id = item.id || 0;
			user.email = item.email || 0;
			user.username = item.name || "error"
			user.discordid = item.discordid || "Not Assigned";
			user.permissions = item.permissions || 0;
		})
		res.render("manageUsers",{
			errors:false,
			user:user
		})

	})







})
