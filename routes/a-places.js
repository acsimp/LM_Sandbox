var express = require("express");
// with this we are swapping "app" for "router"
var router  = express.Router();
var Place = require("../models/place");
var middleware = require("../middleware");
var request = require('request-promise');  



//APPLE MAP - show apple map of places
router.get("/a-map", function(req, res){
    //get all places from the db
  Place.find({}, function(err, allPlaces){
        if(err){
            console.log(err);
      } else {
            //res.render("places/index");
            
          res.render("places/a-map",{places:allPlaces, currentUser: req.user, page: 'map'});

        }
    });
});


//A-NEW - show form to create new apple place
router.get("/a-new", function(req, res){
    // var name = req.params.name;
    var name = req.query.name;
   // var name = JSON.parse(txt);
   console.log(name);
    res.render("places/a-new", {name: name});
});


// part of fuzzy search
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

//exporting "router"
module.exports = router;



