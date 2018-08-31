var express = require('express'),
    app = express(),
    path = require('path'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    ConnectMongo = require('connect-mongo')(session),
    mongoose = require('mongoose'),
    config = require('./config/config.js'),
    passport = require('passport'),
    FacebookStrategy = require('passport-facebook').Strategy,
    rooms = []

app.set('views',path.join(__dirname,'views'));
app.engine('html',require('hogan-express'));
app.set('view engine','html');
app.use(express.static(path.join(__dirname,'public')));
app.use(cookieParser());

mongoose.connect(config.dbURL,function(err){
    if(err){
        console.log("Connection Error : " + err);
        process.exit(1);
    } else{
        console.log("Connection established to Mongo DB");
    }
});

// var env = process.env.NODE_ENV || 'development';
// setupENV(env);

app.use(session({
    secret:config.sessionSecret, 
    saveUninitialized:true, 
    resave:true,
    store: new ConnectMongo({
        url:config.dbURL,
        mongoose_connection:mongoose.connections[0],
        stringify:true
      })
}));

app.use(passport.initialize());
app.use(passport.session());
require('./auth/passportAuth.js')(passport, FacebookStrategy ,config,mongoose);

require('./routes/routes.js')(express, app,passport,config,rooms);

app.set('port', 3000);
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
require('./socket/socket.js')(io, rooms);

server.listen(app.get('port'),function(){
    console.log('chatCAT on : ' + config.host);
    console.log('chatCAT Mode : development');
})
