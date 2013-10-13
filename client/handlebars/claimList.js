var isUnverifiedClaim = function (claim) {
    return claim.status === 0;
}

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