// api/models/UserModel.js

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectID;

var UserSchema = new Schema({

    username:    {
        type:     String,
        required: true,
        trim:     true,
        unique:   true
    },
    password:    {
        type:     String,
        required: true
    },
    email:       {
        type:     String,
        required: true,
        trim:     true,
        unique:   true
    },
    emailToken:  {
        type:   String,
        unique: true
    },
    accessToken: {
        type:    String
    },
    accessTimestamp: {
        type:    Date
    }

});

UserSchema.path('email').validate(function (email) {
    var emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
    return emailRegex.test(email); // Assuming email has a text attribute
}, 'E-Mail must be valid');

module.exports = mongoose.model('User', UserSchema);