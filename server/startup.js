Meteor.startup(function () {

    Meteor.methods({

        updateClaimStatus: function(scavengeId, claimer, newStatus) {
            Scavenges.update( { _id: scavengeId, claims: { claimer: claimer, status: 0} }, { $set: { "claims.$" : { claimer: claimer, status: newStatus} } } )
        }

    })
});