Scavenges = new Meteor.Collection("scavenges");

if (Meteor.isClient) {

    Router.configure({
        layout: "authShell",

        notFoundTemplate: 'notFound',
        loadingTemplate: 'loading',

        renderTemplates: {
            leaderboard: {to: 'leaderboard'},
            navbar: {to: 'navbar'}
        }
    });

}
