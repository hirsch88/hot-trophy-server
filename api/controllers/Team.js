// api/controllers/Team.js

var Team = require('../models/TeamModel');


var TeamController = {

    read: function (req, res) {
        Team.find(function (err, teams) {
            if (err)
                res.send(err);

            res.json(teams);
        });
    },

    readById: function (req, res) {
        Team.findById(req.params.team_id, function (err, team) {
            if (err)
                res.send(err);
            res.json(team);
        });
    },

    create: function (req, res) {
        var team = new Team({
            sign:     req.body.sign,
            name:     req.body.name,
            logoLink: req.body.logoLink
        });

        // save the team and check for errors
        team.save(function (err) {
            if (err)
                res.send(err);

            res.json({message: 'Team created!'});
        });
    },

    update: function (req, res) {
        // use our team model to find the team we want
        Team.findById(req.params.team_id, function (err, team) {

            if (err)
                res.send(err);

            team.name = req.body.name;  // update the teams info

            // save the team
            team.save(function (err) {
                if (err)
                    res.send(err);

                res.json({message: 'Team updated!'});
            });

        });
    },

    destroy: function (req, res) {
        Team.remove({
            _id: req.params.team_id
        }, function (err, team) {
            if (err)
                res.send(err);

            res.json({message: 'Successfully deleted'});
        });
    }

};

module.exports = TeamController;
