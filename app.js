var express         = require("express"),
    app             = express(),
    bodyParser      = require("body-parser"),
    mongoose        = require("mongoose"),
    flash           = require("connect-flash"),
    passport        = require("passport"),
    LocalStrategy   = require("passport-local"),
    methodOverride  = require("method-override"),    
    Place           = require("./models/place"),
    User            = require("./models/user"),
    dotenv_var      = require('dotenv').config(),
    port = process.env.PORT || 3000,
    request         = require('request-promise');  


//requiring routes
var placeRoutes    = require("./routes/places");
var indexRoutes    = require("./routes/index");


mongoose.connect("mongodb://Andrew:Dogma6969@ds129321.mlab.com:29321/lm_sandbox");
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
//seedDB(); //seed the database
app.use(flash());

//passport configuration
app.use(require("express-session")({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false
}));
app.locals.moment = require('moment');
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//middleware - pass currentUser to all templates. Anything in res.locals is available inside templates
app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});
// use the route files that we have required with a prefix that will be added to all routes in that file.
app.use("/places", placeRoutes);
app.use("/", indexRoutes);

// handle 404 error status
app.use(function(req, res, next) {
    res.status(404);
    req.flash('info', 'Flash is back!');
    res.render("404", { messages: req.flash('info') });
});

// caching disabled for every route
app.use(function(req, res, next) {
  res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  next();
});

//====================================================
//tell express to listen for requests (start server)
//app.listen(process.env.PORT, process.env.IP, function(){
app.listen(port, function(){
    console.log("The LM_Sandbox Server has started on https://localhost");
 });
