var express = require("express");
// with this we are swapping "app" for "router"
var router = express.Router();
var Place = require("../models/place");
var middleware = require("../middleware");
var request = require('request-promise');



//APPLE MAP - show apple map of places
router.get("/a-map", middleware.isLoggedIn, function(req, res) {
    //get all places from the db
                res.render("places/a-map", {currentUser: req.user });

    // Place.find({}, function(err, allPlaces) {
    //     if (err) {
    //         console.log(err);
    //     }
    //     else {
    //         //res.render("places/index");

    //         res.render("places/a-map", { places: allPlaces, currentUser: req.user, page: 'map' });

    //     }
    // });
});


//A-NEW - show form to create new apple place
router.get("/a-new", function(req, res) {
    // var name = req.params.name;
    // var name = req.query.name;
    // var formattedAddress = req.query.formattedAddress;
    // var latitude = req.query.latitude;
    // var longitude = req.query.longitude;
    // var muid = req.query.muid;
    // var _wpURL = req.query._wpURL;
    // var name = JSON.parse(txt);
    // console.log(_wpURL);
    res.render("places/a-new", { page: 'new' });
});

//---------------------------------------------------------------------------------------------------------------

//FB-SEARCH - search FB using Apple place
router.get("/fb-search", middleware.isLoggedIn, function(req, res) {
    var searchQuery = req._parsedUrl.search;
    if (req.query.name) {
        var q = req.query.name;
        // console.log(q);
    }
    if (req.query.longitude) {
        var longitude = req.query.longitude;
        // console.log(longitude);
    }
    if (req.query.latitude) {
        var latitude = req.query.latitude;
        // console.log(latitude);
    }
    if (req.query.radius) {
        var radius = req.query.radius;
        // console.log(latitude);
    } else {
        var radius = '1000'; //in meters 
    }
    // you need permission for most of these fields
    const userFieldSet = 'id, name, location, checkins, link, rating_count, overall_star_rating, photos{images}, price_range, single_line_address, picture, category_list, cover, engagement, website';
    var coords = latitude + ", " + longitude;
    //var coords = '55.8480, -4.4128';
    var limit = 30;

    const options = {
        method: 'GET',
        //uri: `https://graph.facebook.com/v3.0/search?type=place&fields=name,checkins,picture&categories=["FOOD_BEVERAGE"]&center=55.8480,-4.4128&distance=1000`,
        uri: `https://graph.facebook.com/v3.0/search?type=place`,
        qs: {
            access_token: process.env.access_token,
            fields: userFieldSet,
            center: coords,
            distance: radius,
            q: q,
            limit: limit,
        }
    };
    request(options)
        .then(fbRes => {
            var place = JSON.parse(fbRes);
            // if (place.data.length == 0) {
            //     res.redirect("a-new");
            // }
            // else {
            //res.json(place);
            
            
           
            
            // this code calculates and adds the distance from search coordinate to the JSON data
            for (var i = 0; i < place.data.length; i++) {
                var distance = getDistanceFromLatLonInKm(latitude,longitude,place.data[i].location.latitude,place.data[i].location.longitude);
                place.data[i].distance = distance;
                //if place.website does not contain http:// or https:// it simple adds to the end of current url
                //this code checks for http and adds if missing
                if (place.data[i].website) {
                    var tarea = place.data[i].website;
                    //console.log(tarea);
                    if (tarea.indexOf("http://") == 0 || tarea.indexOf("https://") == 0) {}
                    else {
                        place.data[i].website = "http://" + place.data[i].website;
                        //console.log(place.website);
                    }
                }
                //console.log(place.data[i].distance);
            }

            res.render('places/list', { place: place, searchQuery: searchQuery, q: q, latitude: latitude, longitude: longitude, radius: radius });
            // }
        })
        // .catch(function(err) {
        //     // API call failed...
        //     console.log(err);
        //     res.status(err).send("failed to return response - ");
        // });
        .catch(function (error) {
            // I think only the last part of this (just the else statement) is actually working here. I don't think error status codes are being read properly
            if (error.status === 400) {
              console.log('Bad request, often due to missing a required parameter.');
            } else if (error.status === 401) {
              console.log('No valid API key provided.');
            } else if (error.status === 404) {
              console.log('The requested resource doesn\'t exist.');
            } else {
                console.log('Probably and invalid request to the facebook api error');
                var place = {};
                res.render('places/list', { place: place, searchQuery: searchQuery, q: q, latitude: latitude, longitude: longitude, radius: radius });

            }
          });
});


//---------------------------------------------------------------------------------------------------------------

//G-SEARCH - search Google using Apple place
router.get("/g-search", middleware.isLoggedIn, function(req, res) {
    var searchQuery = req._parsedUrl.search;
    const key = 'AIzaSyBspXmmxN0uaVfTHsoc8m4bSTvQ9nIcPFk';

    if (req.query.name) {
        var name = req.query.name;
        // console.log(q);
    }
    if (req.query.address) {
        var address = req.query.address;
        // console.log(q);
    }
    if (req.query.longitude) {
        var longitude = req.query.longitude;
        // console.log(longitude);
    }
    if (req.query.latitude) {
        var latitude = req.query.latitude;
        // console.log(latitude);
    }
    if (req.query.radius) {
        var radius = req.query.radius;
        // console.log(latitude);
    } else {
        var radius = '2500';
    }

    

    // you need permission for most of these fields
    //const userFieldSet = 'photos,formatted_address,name,opening_hours,rating';
    const userFieldSet = 'address_component,adr_address,alt_id,formatted_address,geometry,icon,id,name,permanently_closed,photo,place_id,scope,type,url,utc_offset,vicinity';
    //const userFieldSet = 'formatted_address,geometry,id,name,place_id,vicinity';
    var coords = latitude + "," + longitude;

    const options = {
        method: 'GET',
        uri: `https://maps.googleapis.com/maps/api/place/nearbysearch/json?`,
        // uri: `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?`,
        //input=mongolian%20grill&inputtype=textquery&fields=photos,formatted_address,name,opening_hours,rating&locationbias=circle:2000@47.6918452,-122.2226413&key=YOUR_API_KEY

        qs: {
            //access_token: process.env.access_token,
            location: coords,
            radius: radius,
            // input: name,
            // inputtype: "textquery",
            fields: userFieldSet,
            // locationbias: "circle:" + radius + "@" + latitude,longitude,
            keyword: name + address,
            key: key,
        }
    };
    request(options)
        .then(fbRes => {
            var googlePlaces = JSON.parse(fbRes);
            // console.log(googlePlaces);
            // res.json(googlePlaces);
            
            for (var i = 0; i < googlePlaces.results.length; i++) {
                var distance = getDistanceFromLatLonInKm(latitude,longitude,googlePlaces.results[i].geometry.location.lat,googlePlaces.results[i].geometry.location.lng);
                googlePlaces.results[i].distance = distance;
                //console.log(place.data[i].distance);
                // console.log(googlePlaces);
            }
            
            res.render('places/g-search', { place: googlePlaces, searchQuery: searchQuery, name: name, address: address, longitude: longitude, latitude: latitude, radius: radius });
        })
        .catch(function(err) {
            // API call failed...
            console.log(err);
            res.status(err).send("failed to return response - ");
        });

});


//---------------------------------------------------------------------------------------------------------------


// part of fuzzy search
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

//exporting "router"
module.exports = router;



 function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
              var R = 6371; // Radius of the earth in km
              var dLat = deg2rad(lat2-lat1);  // deg2rad below
              var dLon = deg2rad(lon2-lon1); 
              var a = 
                Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
                Math.sin(dLon/2) * Math.sin(dLon/2)
                ; 
              var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
              var d = R * c; // Distance in km
              return d;
            }
            
            function deg2rad(deg) {
              return deg * (Math.PI/180);
            }