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