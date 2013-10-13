var pointsForUser = function(user) {
    var completedScavenges = Scavenges.find({claims : {$all : [{claimer: user.username, status: 1}]}}).fetch();
    var score = 0;

    completedScavenges.forEach(function(scavenge) {
        score += scavenge.points;
    });

    return score;
}

Template.leaderboard.helpers({

    results: function() {
        var users = Meteor.users.find().fetch();

        return _.map(users, function(user) {
            return {
                user: user,
                points: pointsForUser(user)
            };
        });
    }

});