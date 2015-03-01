// api/models/TableSchema.js

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectID;

var TableSchema = new Schema({
    rank:   {
        type:     Number,
        required: true
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

    yellowCard: {
        type: Number,
        default: 0
    },
    redCard:    {
        type: Number,
        default: 0
    },
    score:      {
        type: Number,
        default: 0
    }
});