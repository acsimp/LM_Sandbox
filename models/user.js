var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
    username: {type: String, unique: true},
    password: String,
    avatar: String,
    firstname: String,
    lastname: String,
    email: {type: String, unique: true, required: true},
    isAdmin: {type: Boolean, default: false},
    comments: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }],
    
});

UserSchema.plugin(passportLocalMongoose, { usernameField : 'email' });

module.exports = mongoose.model("User", UserSchema);