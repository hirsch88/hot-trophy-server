// api/controllers/Event.js

var Event = require('../models/EventModel');


var EventController = {


    create: function (req, res) {
        var event = new Event({
            name:     req.body.name,
            date:     req.body.date
        });




        // save the event and check for errors
        //event.save(function (err) {
        //    if (err)
        //        res.send(err);
        //
        //    res.json({message: 'Event created!'});
        //});
    },

    read: function (req, res) {
        Event.find(function (err, events) {
            if (err)
                res.send(err);

            res.json(events);
        });
    }

    //readById: function (req, res) {
    //    Event.findById(req.params.event_id, function (err, event) {
    //        if (err)
    //            res.send(err);
    //        res.json(event);
    //    });
    //},

    //update: function (req, res) {
    //    // use our event model to find the event we want
    //    Event.findById(req.params.event_id, function (err, event) {
    //
    //        if (err)
    //            res.send(err);
    //
    //        event.name = req.body.name;  // update the events info
    //
    //        // save the event
    //        event.save(function (err) {
    //            if (err)
    //                res.send(err);
    //
    //            res.json({message: 'Event updated!'});
    //        });
    //
    //    });
    //},
    //
    //destroy: function (req, res) {
    //    Event.remove({
    //        _id: req.params.event_id
    //    }, function (err, event) {
    //        if (err)
    //            res.send(err);
    //
    //        res.json({message: 'Successfully deleted'});
    //    });
    //}

};

module.exports = EventController;
