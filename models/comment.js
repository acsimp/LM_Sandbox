var mongoose = require("mongoose");

var commentSchema = mongoose.Schema({
    title: String,
    text: String, 
    createdAt: { type: Date, default: Date.now },
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    rating: {
        overall_star: Number,
        cost_star: Number,
        baby_change_star: Number,
        food_star: Number,
        play_star: Number,
        staff_star: Number,
        breastfeeding_star: Number,
    },
    place: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Place"
        },
        name: String
    },
});

module.exports = mongoose.model("Comment", commentSchema);