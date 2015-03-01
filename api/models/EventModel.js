// api/models/EventModel.js

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectID;


var TeamSchema = require('./TeamSchema');

var EventSchema = new Schema({
    name: {
        type: String,
        trim: true,
        required: true
    },
    date: {
        type:    Date,
        default: Date.now
    },

    amountTeams: {
        type:     Number,
        default:  3,
        min:      3
    },

    amountFields: {
        type:     Number,
        default:  1,
        min:      1
    },

    type: {
        type:     String,
        enum:     [
            'Soccer',
            'FIFA'
        ],
        default: 'FIFA',
        required: true
    },

    tournamentType: {
        type:     String,
        enum:     [
            'Liga',
            'KO',
            'Groups/KO'
        ],
        default: 'Liga',
        required: true
    },

    teams: [TeamSchema]

    //hasReturnLeg: {
    //    type: Boolean,
    //    default: false
    //},
    //
    //hasScorer: {
    //    type: Boolean,
    //    default: false
    //},
    //
    //hasYellowCards: {
    //    type: Boolean,
    //    default: false
    //},
    //
    //hasRedCards: {
    //    type: Boolean,
    //    default: false
    //}


});

module.exports = mongoose.model('Event', EventSchema);