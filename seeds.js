var mongoose    = require("mongoose");
var Campground  = require("./models/campground");
var Comment     = require("./models/comment"); 

var data = [
        {
            name: "Journaling",
            image: "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?auto=format&fit=crop&w=1050&q=80&ixid=dW5zcGxhc2guY29tOzs7Ozs%3D",
            description: "The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from de Finibus Bonorum et Malorum by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham."
        },
        {
            name: "Hamburg",
            image: "https://images.unsplash.com/photo-1485069203392-8e1aeb1ebf02?auto=format&fit=crop&w=1054&q=80&ixid=dW5zcGxhc2guY29tOzs7Ozs%3D",
            description: "The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from de Finibus Bonorum et Malorum by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham."
        },
        {
            name: "Big Ben",
            image: "https://images.unsplash.com/photo-1489442513325-6e77bc98de06?auto=format&fit=crop&w=967&q=80&ixid=dW5zcGxhc2guY29tOzs7Ozs%3D",
            description: "The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from de Finibus Bonorum et Malorum by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham."
        }
    ];

function seedDB(){
    Campground.remove({}, function(err){
        if(err){
            console.log(err);
        } else {
            console.log("removed campgrounds");
            data.forEach(function(seed){
                Campground.create(seed, function(err, createdCampground){
                    if(err) {
                        console.log(err);
                    }else{
                        console.log("added a campground");
                        Comment.create({
                            text: "This place is great!",
                            author: "Hommer"
                        }, function(err, comment){
                            if(err){
                                console.log(err);
                            } else {
                                createdCampground.comments.push(comment);
                                createdCampground.save();
                                console.log("created new comment");
                            }
                        });
                    }
                });
            });
        }
    });
    
    
}

module.exports = seedDB;