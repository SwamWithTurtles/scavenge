Template.authShell.events({
    'submit' : function() {

        if(event.srcElement.id === "login") {
            Meteor.loginWithPassword($("#username").val(), $("#password").val(), function(error) {
                error ? $("#loginError").html(error.message) : "";
            });

            event.preventDefault();

        } else if (event.srcElement.id === "register") {

            var registerOpts = {
                username: $("#new_username").val(),
                password: $("#new_password").val(),
                email: $("#email").val(),
            };

            Accounts.createUser(registerOpts, function(error) {
                error ? $("#registerError").html(error.message) : "";
            });

            event.preventDefault();
        }
    }
});
