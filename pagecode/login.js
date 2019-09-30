const web = require("../webGUI.js")
const ds = require("../main.js")


web.app.post('/login', web.passport.authenticate('local', { successRedirect: '/music', failureRedirect: '/login', failureFlash: false }),
	function (req, res) {
	res.redirect('/');
})


web.app.get('/login', function(req, res){


  res.render("login",{

  })



})

web.app.get('/logout', function (req, res) {

	req.logout();

	res.redirect('/login');

});
