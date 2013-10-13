Scavenges = new Meteor.Collection("scavenges");

///ROUTER CONFIG

Router.map(function() {
    this.route('register')

    this.route('home', {path : '/'});

    this.route('addScavenge');

    this.route('listScavenges', {
        path: '/scavenges',
        controller: 'ScavengesController'
    });

    this.route('moderateClaims', {
        path: '/claims',
        controller: 'ClaimsController'
    })
});


if (Meteor.isClient) {

    Router.configure({
        layout: "authShell",

        notFoundTemplate: 'notFound',
        loadingTemplate: 'loading',

        renderTemplates: {
            leaderboard: {to: 'leaderboard', data: {results: getLeaderboardData()}},
            navbar: {to: 'navbar'}
        }
    });

///CONTROLLERS

    ScavengesController = RouteController.extend({
        data: getActiveScavenges(),
        template: 'scavenges'
    });

    ClaimsController = RouteController.extend({
        data: Meteor.user() ? getUsersScavenges(Meteor.user().username)
                            : {},
        template: 'claims'
    });

///HANDLEBARS HELPERS

    Handlebars.registerHelper('scavenge-format', function(scavenges) {

        var getStatus = function(scavenge) {

            if(Meteor.user().username === scavenge.owner) {
                return {
                    class: "yours",
                    inputText : new Handlebars.SafeString("<input type=\"button\" class=\"expireScavenge\" data=\"" + scavenge._id + "\" value=\"Expire this scavenge\">")
                };
            }

            var potentialClaim = _.filter(scavenge.claims, function (claim) {return claim.claimer === Meteor.user().username});

            if(!potentialClaim.length) {
                return {
                    class: "notClaimed" ,
                    inputText: new Handlebars.SafeString("<input type='button' class='claim' data='"+ scavenge._id +"' value='Claim'/>")
                    }
            }

            //There should only be one claim - but just in case there are more take the furthest advanced one
            var claimStatus = _.max(potentialClaim, function(claim) {return claim.status}).status;

            switch(claimStatus) {

                case -1:
                return {
                    class: "notClaimed",
                    inputText: new Handlebars.SafeString("Not Approved... <input type='button' class='claim' data='" + scavenge._id +"' value='Claim Again?'/>")
                };

                case 0:
                return {
                    class: "inactive",
                    inputText: "Pending! :|"
                };

                case 1:
                return {
                    class: "inactive",
                    inputText: "Done! :)"
                };

            };
        }


        var formatScavenge = function(scavenge) {

            var owner = (Meteor.user().username === scavenge.owner) ? "you" : scavenge.owner;

            return {
                owner: owner,
                points: scavenge.points,
                hashedEmail: scavenge.hashedEmail,
                description: scavenge.description,
                status: getStatus(scavenge)
            }

        }

        return _.map(scavenges, formatScavenge);

    });

    var isUnverifiedClaim = function (claim) {
        return claim.status === 0;
    }

//HANDLEBARS HELPERS

    Handlebars.registerHelper('unmoderated', function (scavenges) {
        hasOutstanding = function(claims) {
            var outstandingClaims = _.filter(claims, isUnverifiedClaim);
            return outstandingClaims.length > 0;
        }

        return _.filter(scavenges, function(scavenge) { return hasOutstanding(scavenge.claims) });
    });

    Handlebars.registerHelper('outstanding', function (claims) {
        return _.filter(claims, isUnverifiedClaim);
    });

    Handlebars.registerHelper('sorted', function(results) {
        return _.sortBy(results, function(result) {return result.points}).reverse();
    });

///TEMPLATE EVENTS

    Template.authShell.events({
        'submit' : function() {

            if(event.srcElement.id === "login") {
                Meteor.loginWithPassword($("#username").val(), $("#password").val(), function(error) {
                    error ? $("#loginError").html(error.message) : "";
                });

                event.preventDefault();

            } else if (event.srcElement.id === "register") {

                var registerOpts = {
                    username: $("#new_username").val(),
                    password: $("#new_password").val(),
                    email: $("#email").val(),
                };

                Accounts.createUser(registerOpts, function(error) {
                    error ? $("#registerError").html(error.message) : "";
                });

                event.preventDefault();
            }
        }
    });

    Template.claims.events({

        'click .accept' : function() {
            var scavengeId = $(event.srcElement).closest(".scavengeClaim").attr("data");
            var claimer = $(event.srcElement).attr("data");

            Meteor.call("updateClaimStatus", scavengeId, claimer, 1);

            window.location.reload();
        },

        'click .reject' : function() {

            var scavengeId = $(event.srcElement).closest(".scavengeClaim").attr("data");
            var claimer = $(event.srcElement).attr("data");

            Meteor.call("updateClaimStatus", scavengeId, claimer, -1);

            window.location.reload();
        }
    });

    Template.addScavenge.events({

        'click .submitScavenge' : function() {
            submitScavengeForm();
        }
    });

    Template.scavenges.events({

        'click .claim' : function() {
            var scavengeId = $(event.srcElement).attr("data");

            claim = {
                claimer: Meteor.user().username,
                status: 0
            }

            Scavenges.update(scavengeId, {$push: {claims: claim}});

            window.location.reload();
        },

        'click .expireScavenge' : function() {
            var scavengeId = $(event.srcElement).attr("data");

            Scavenges.update(scavengeId, {$set: {active: 0}});

            window.location.reload();
        }
    });
}

///SERVER CODE

if (Meteor.isServer) {

    Meteor.startup(function () {
        Meteor.methods({

            updateClaimStatus: function(scavengeId, claimer, newStatus) {
                Scavenges.update( { _id: scavengeId, claims: { claimer: claimer, status: 0} }, { $set: { "claims.$" : { claimer: claimer, status: newStatus} } } )
            }

        })
    });
}

///GATEWAY-LIKE UTILITY FUNCTIONS

function getLeaderboardData() {

    var users = Meteor.users.find().fetch();

    return _.map(users, function(user) {
        return {
            user: user,
            points: pointsForUser(user)
        };
    });
};

function pointsForUser(user) {
    var completedScavenges = Scavenges.find({claims : {$all : [{claimer: user.username, status: 1}]}}).fetch();
    var score = 0;

    completedScavenges.forEach(function(scavenge) {
        score += scavenge.points;
    });

    return score;
}

function submitScavengeForm() {
    var points = $("#points").val();
    var description = $("#description").val();

    if(!isNumber(points) || parseInt(points) < 0) {
        $("#scavengeError").html("Points should be a positive integer");
        return;
    }

    if(parseInt(points) > 99) {
        $("#scavengeError").html("You cannot assign more than 100 points for any one scavenge");
        return;
    }

    if(description.length > 80) {
        $("#scavengeError").html("Please limit the description to a maximum of 80 characters");
        return;
    }

    Scavenges.insert({
        points: parseInt(points),
        description: description, //TODO: Escape
        owner: Meteor.user().username,
        hashedEmail: MD5().hex_md5($.trim(Meteor.user().emails[0].address)),
        active: 1,
        claims: []
    }, function() {
        Router.go("/scavenges")
        window.location.reload();
    });
}

function getActiveScavenges() {
    return {
        scavenges: Scavenges.find({active: 1}).fetch()
    };
}

function getUsersScavenges(username) {
    var scavenges = Scavenges.find({owner: username}).fetch();
    return {
        scavenges: scavenges,
    }
}

function isNumber(number) {
    var intRegex = /^\d+$/;
    return intRegex.test(number);
}