var mongoose = require("mongoose");

//schema setup
var placeSchema = new mongoose.Schema({
    name: String,
    description: String,
    single_line_address: String,
    category: [],
    fb_id: String,
    location: String, //not sure of what this one is
    opening_hours: {},
    price: String,
    image: String,
    lat: Number,
    lng: Number,
    createdAt: { type: Date, default: Date.now },
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
        ]
   
});

module.exports = mongoose.model("Place", placeSchema);