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