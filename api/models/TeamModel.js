// api/models/TeamModel.js

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectID;

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
    }
});

module.exports = mongoose.model('Team', TeamSchema);