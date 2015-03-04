// api/models/EventModel.js

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectID;


var TeamSchema = require('./TeamSchema');

var EventService = require('../services/EventService');

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

    amountPitches: {
        type:     Number,
        default:  1,
        min:      1
    },

    kind: {
        type:     String,
        enum: EventService.getKinds(),
        //enum:     [
        //    'soccer',
        //    'fifa'
        //],
        //default: 'fifa',
        required: true
    },

    mode: {
        type:     String,
        enum:     EventService.getModes(),
        //enum:     [
        //    'liga',
        //    'kO',
        //    'groups/kO'
        //],
        //default: 'liga',
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