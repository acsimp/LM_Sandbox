var mongoose = require("mongoose");

var commentSchema = mongoose.Schema({
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