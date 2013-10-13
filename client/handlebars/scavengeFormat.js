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
                inputText: new Handlebars.SafeString("<br />Your last claim was rejected. <br/><input type='button' class='claim' data='" + scavenge._id +"' value='Claim Again?'/>")
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