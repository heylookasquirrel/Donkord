const web = require("../webGUI.js")
const ds = require("../main.js")


web.app.post('/settings/users', web.app.ensureAuthenticated, web.app.isAdmin, function (req, res) {

	res.redirect('/settings/users');

})


// Temporary change
// web.app.ensureAuthenticated, web.app.isAdmin,
web.app.get('/settings/users',  function(req, res){

	let users = []

	ds.bot.db.query("SELECT * FROM `users` WHERE 1", (err, results, fields) => {
    results.forEach( user => {
			let userObject = {}
			userObject.id = user.id || 0;
			userObject.username = user.name || "error"
			userObject.discordid = user.discordid || "Not Assigned";
			userObject.permission = user.permission || 0;


			users.push(userObject)
		})
		res.render("settingsUsers",{
			users:users
		})

	})







})
