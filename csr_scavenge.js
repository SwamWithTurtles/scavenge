Scavenges = new Meteor.Collection("scavenges");

///ROUTER CONFIG

Router.map(function() {
    this.route('register')

    this.route('home', {path : '/'});

    this.route('addScavenge', {
        path: '/addScavenge',
        controller: 'AddScavengeController'
    });

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
        leaderboard: {to: 'leaderboard', data: getLeaderboardData()},
        navbar: {to: 'navbar'}
     }
 });

///CONTROLLERS

AddScavengeController = RouteController.extend({
    template: 'addScavenge'

});

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

 Handlebars.registerHelper('scavenge-format', function(scavanges) {


    var getStatus = function(scavenge) {

        var isYours = (Meteor.user().username === scavenge.owner);

        var status = {};

        if(!isYours) {
            var potentialClaim = _.filter(scavenge.claims, function (claim) {return claim.claimer === Meteor.user().username});

            if(!potentialClaim.length) {
                status = {class: "notClaimed" ,
                   inputText: "<input type='button' class='claim' data='"+ scavenge._id +"' value='Claim'/>"
               }
            } else {

                //There should only be one claim - but just in case there are more take the furthest advanced one
                var claimStatus = _.max(potentialClaim, function(claim) {return claim.status}).status;

                if(claimStatus === 0) {
                    status = { class: "inactive",
                                inputText: "Pending"

                             };
                } else if (claimStatus === -1) {
                    status = { class: "notClaimed",
                        inputText: "Not Approved... <input type='button' class='claim' data='" + scavenge._id +"' value='Claim Again?'/>"};
                } else {
                    status = { class: "inactive",
                        inputText: "Already Achieved"};
                }

            }
        } else {
            status = { class: "yours",
                inputText : "<input type=\"button\" class=\"expireScavenge\" data=\"" + scavenge._id + "\" value=\"Expire this scavenge\">"
           };
        }

        return {class: status.class, inputText: new Handlebars.SafeString(status.inputText)};
    }

    var formatScavange = function(scavenge) {

        var owner = (Meteor.user().username === scavenge.owner) ? "you" : scavenge.owner;

        return {
            owner: owner,
            points: scavenge.points,
            hashedEmail: scavenge.hashedEmail,
            description: scavenge.description,
            status: getStatus(scavenge)
        }

    }

    debugger;

    return _.map(scavanges, formatScavange);

  });

  Handlebars.registerHelper('scavengeClaim', function() {

   var scavenges = getUsersScavenges(Meteor.user().username).scavenges.fetch();
   var code = "";

   scavenges.forEach(function(s) {
    outstandingClaims = _.filter(s.claims, function(claim) { return claim.status === 0 });
    if(outstandingClaims.length) {

    code += "<div class='scavengeClaim' data ='" + s._id + "'>" +
               "<h1>" + s.description + " ("+ s.points +" point" + (s.points === 1 ? "" : "s") + ")</h1>";

    _.filter(s.claims, function(claim) {return claim.status === 0}).forEach(function(claim) {
        code += claimRequest(claim);
    });

    code += "</div>";
    }});


    return new Handlebars.SafeString(code ? code : "You have no outstanding scavenges to review");
  })

  var claimRequest = function(claim) {

      var code = "<div class=\"claim\">" +
          claim.claimer + " has claimed they have completed this</br>"
        + "<input type='button' class='accept' value='They have!' data=\"" + claim.claimer +"\"/>"
        + "<input type='button' class='reject' value='They are lying!' data=\"" + claim.claimer +"\"/>"
        + "</div>";

        return code;
  };

    Handlebars.registerHelper('sorted', function(context, options) {
      var result = [];
      _.each(context, function(value, key, list){
        result.push({user:key, points:value});
      })
      var array = _.sortBy(result, function(r) {return r.points}).reverse();
      return array;
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
     }}
 );

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
    var scores = {};

    users.forEach(function(user) {
        scores[user.username] = pointsForUser(user);
    });


    return {
          points: scores
    }

 }

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
        //TODO: Escape
        description: description,
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
    }
}

function getUsersScavenges(username) {
    var scavenges = Scavenges.find({owner: username});

    return {
        scavenges: scavenges,
    }
}


function isNumber(number) {
  var intRegex = /^\d+$/;
  return intRegex.test(number);
}

