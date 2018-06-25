var express         = require("express"),
    app             = express(),
    bodyParser      = require("body-parser"),
    mongoose        = require("mongoose"),
    flash           = require("connect-flash"),
    passport        = require("passport"),
    LocalStrategy   = require("passport-local"),
    methodOverride  = require("method-override"),
    Campground      = require("./models/campground"),
    Comment         = require("./models/comment"),
    User            = require("./models/user"),
    seedDB          = require("./seeds");
    
var commentRoutes   = require("./routes/comments"),
    campgroundRoutes= require("./routes/campgrounds"),
    indexRoutes     = require("./routes/index");
    

//connect to mongodb server
mongoose.connect(process.env.DATABASEURL, {useMongoClient: true});
// mongoose.connect("mongodb://dariodado:drfedrttt123@ds135866.mlab.com:35866/yelpcampdeveloper", {useMongoClient: true});
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());

// seedDB();

//config express session package
app.use(require("express-session")({
    secret: "bilo sta, uz pomoc ovog stringa kodira i dekodira podatke u sesiji",
    resave: false,
    saveUninitialized: false
}))

//config moment package
app.locals.moment = require("moment");

//config passport package
app.use(passport.initialize());
app.use(passport.session());
//config passport-local package
passport.use(new LocalStrategy(User.authenticate()));
//config passport package
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//da ne bi rucno unosili podatak o trenutno ulogovanom useru koji treba da prosledimo svim rutama, mozemo to da uradimo ovako
app.use(function(req,res,next){
    res.locals.currentUser = req.user;
    res.locals.errorMessage = req.flash("error");
    res.locals.successMessage = req.flash("success");
    next();
});


app.use("/campgrounds/:id/comments", commentRoutes);
app.use("/", indexRoutes);
app.use("/campgrounds", campgroundRoutes);



app.listen(process.env.PORT, process.env.ID, function(){
    console.log("The YelpCamp server has started!");
});