Template.addScavenge.events({

    'click .submitScavenge' : function() {
        submitScavengeForm();
    }
});

var submitScavengeForm = function() {
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

var isNumber = function(number) {
    var intRegex = /^\d+$/;
    return intRegex.test(number);
}
