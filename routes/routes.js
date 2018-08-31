module.exports = function(express,app,passport,config,rooms){
	var router = express.Router();

	router.get('/',function(req,res,next){
		res.render('index', {title:'Welcome to orangeBear CHAT-ROOM'});
	})

	function securePages(req,res,next){
		if(req.isAuthenticated()){
			next();
		} else {
			res.redirect('/');
		}
	}

	router.get('/auth/facebook',passport.authenticate('facebook'));
	app.get('/auth/facebook/callback',
		passport.authenticate('facebook', { successRedirect: '/chatrooms',
                                      failureRedirect: '/' }));

	router.get('/chatrooms',securePages,function(req,res,next){
		res.render('chatrooms',{
			title: 'ChatRooms',
			user: req.user,
		});
		// console.log(user);
	});

	router.get('/room/:id',securePages,function(req,res,next){
		var room_name = findTitle(req.params.id);
		if(room_name == undefined){
			res.redirect('/');
		}
		res.render('room',{
			user:req.user,
			room_number:req.params.id,
			room_name:room_name,
			config:config
		});
	})

	function findTitle(room_id){
		var n = 0;
		while(n < rooms.length){
			if(rooms[n].room_number == room_id){
				return rooms[n].room_name;
			} else {
				n++;
				continue;
			}
		}
	}

	router.get('/logout',function(req,res,next){
		req.logout();
		res.redirect('/');
	});

	app.use('/',router);
}