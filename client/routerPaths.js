Router.map(function() {
    this.route('register')

    this.route('home', {path : '/'});

    this.route('addScavenge');

    this.route('listScavenges', {
        path: '/scavenges',
        controller: 'ScavengesController'
    });

    this.route('moderateClaims', {
        path: '/claims',
        controller: 'ClaimsController'
    })
});