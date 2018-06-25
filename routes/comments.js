var express = require("express");
var router  = express.Router({mergeParams: true});
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware");

//NEW - show form to add a comment
router.get("/new", middleware.isLoggedIn, function(req, res) {
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            console.log(err)
        } else {
            res.render("comments/new", {campground: campground});
        }
    })
    
})

//CREATE - add new comment to DB
router.post("/",middleware.isLoggedIn, function(req, res){
    Campground.findById(req.params.id, function(err, campground) {
        if(err) {
            console.log(err)
        } else {
            Comment.create(req.body.comment, function(err, comment){
                if(err) {
                    console.log(err)
                } else {
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save();
                    campground.comments.push(comment);
                    campground.save();
                    req.flash("success", "You have successfully created a comment!");
                    res.redirect("/campgrounds/"+req.params.id);
                }
            })
        }
    })
})

//EDIT comment route
router.get("/:comment_id/edit",middleware.checkCommentOwnership, function(req,res){
    Comment.findById(req.params.comment_id, function(err, comment) {
        if(err) {
            console.log(err);
        } else {
            res.render("comments/edit", {comment: comment, campgroundId: req.params.id});
        }
    })
})


//UPDATE comment route
router.put("/:comment_id",middleware.checkCommentOwnership, function(req,res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err,comment){
        if(err){
            console.log(err)
        } else {
            req.flash("success", "You have successfully updated your comment!");
            res.redirect("/campgrounds/"+req.params.id);
        }
    })
})

//DELETE comment route
router.delete("/:comment_id",middleware.checkCommentOwnership, function(req,res){
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if(err){
            console.log(err);
        } else {
            req.flash("success", "You have successfully deleted your comment!");
            res.redirect("/campgrounds/"+req.params.id);
        }
    })
})


module.exports = router;