var express = require("express");
var router  = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware");
var geocoder = require('geocoder');
var multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'dariodado', 
  api_key: '481355646219843', 
  api_secret: process.env.CLOUDINARY_API_SECRET
});


router.get("/", function(req,res){
    var perPage = 8;
    var pageQuery = parseInt(req.query.page);
    var pageNumber = pageQuery ? pageQuery : 1;
    
    if(req.query.search){
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        Campground.find({name: regex}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function(err, allcampgrounds) {
            if (err) {
                console.log(err);
            } else {
                
                if(allcampgrounds.length < 1) {
                    var message = "No campgrounds match that query, please try again.";
                    res.render("campgrounds/index", {campgrounds: allcampgrounds, page: 'campgrounds', errorMessage: message, pages: Math.ceil(allcampgrounds.length / perPage)});
                } else {
                    res.render("campgrounds/index", {campgrounds: allcampgrounds, page: 'campgrounds', current: pageNumber, pages: Math.ceil(allcampgrounds.length / perPage)});
                }
            }
        });
    } else {
        Campground.find({}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function(err, allcampgrounds) {
            if (err) {
                console.log(err);
            } else {
                Campground.count().exec(function (err, count){
                    if(err){
                        console.log(err)
                    } else {
                        res.render("campgrounds/index", {campgrounds: allcampgrounds, page: 'campgrounds', current: pageNumber, pages: Math.ceil(count/perPage)});
                    }
                });
            }
        });
    }
});


//CREATE - add new campground to DB
router.post("/", middleware.isLoggedIn, upload.single('image'), function(req,res){
    //get data from form and add to campgrounds array
    
    geocoder.geocode(req.body.location, function (err, data) {
        cloudinary.uploader.upload(req.file.path, function(result) {
            // add cloudinary url for the image to the campground object under image property
            var image = result.secure_url;
            // add author to campground
            var name = req.body.name;
            var price = req.body.price;
            var desc = req.body.description;
            var author = {
                id: req.user._id,
                username: req.user.username
            }
            var lat = data.results[0].geometry.location.lat;
            var lng = data.results[0].geometry.location.lng;
            var location = data.results[0].formatted_address;
            var newCampground = {name: name,price:price, image:image, description:desc, author:author,location:location, lat:lat, lng:lng};
            Campground.create(newCampground, function(err, newlyCreated){
                if(err) {
                    console.log(err);
                } else {
                    req.flash("success", "You created a new campground!");
                    res.redirect("/campgrounds");
                }
            });
        })
    });
});

//NEW - show form to create a new campground
router.get("/new",middleware.isLoggedIn, function(req, res) {
    res.render("campgrounds/new");
});


//SHOW - show detailes about specific campground
router.get("/:id", function(req, res) {
    Campground.findById(req.params.id).populate("comments").exec(function(err,foundCampground){
        if (err) {
            console.log(err);
        } else {
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
    
});


//EDIT campground route
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res) {
    
    Campground.findById(req.params.id, function(err,campground){
        if(err) {
            console.log(err);
        } else {
            res.render("campgrounds/edit", {campground: campground});
        }
    });

});

//UPDATE campground route
router.put("/:id", function(req, res){
  geocoder.geocode(req.body.location, function (err, data) {
    var lat = data.results[0].geometry.location.lat;
    var lng = data.results[0].geometry.location.lng;
    var location = data.results[0].formatted_address;
    var newData = {name: req.body.name, image: req.body.image, description: req.body.description, price: req.body.price, location: location, lat: lat, lng: lng};
    Campground.findByIdAndUpdate(req.params.id, {$set: newData}, function(err, campground){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            req.flash("success","Successfully Updated!");
            res.redirect("/campgrounds/" + campground._id);
        }
    });
  });
});

//DELETE campground route
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findByIdAndRemove(req.params.id, function(err){
        if(err) {
            console.log(err);
        } else {
            req.flash("success", "You have successfully deleted your post!");
            res.redirect("/campgrounds");
        }
    })
})

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};


module.exports = router;