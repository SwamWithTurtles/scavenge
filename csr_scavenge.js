Scavenges = new Meteor.Collection("scavenges");

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