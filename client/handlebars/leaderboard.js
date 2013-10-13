Handlebars.registerHelper('sorted', function(results) {
    return _.sortBy(results, function(result) {return result.points}).reverse();
});