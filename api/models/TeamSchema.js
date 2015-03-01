// api/models/TeamSchema.js

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectID;

var PlayerSchema  = require('./PlayerSchema');

var TeamSchema = new Schema({
    sign:     {
        type:     String,
        required: true,
        trim:     true
    },
    name:     {
        type:     String,
        required: true,
        trim:     true
    },
    logoLink: {
        type: String,
        trim: true
    },

    players:  [PlayerSchema],


});