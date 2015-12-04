// Provide defaults for Meteor.settings
//
// To configure your own Twitter keys, see:
if (typeof Meteor.settings === 'undefined')
  Meteor.settings = {};

_.defaults(Meteor.settings, {
  twitter: {
    consumerKey: "EyGzBQEsy0H1dw2t0m6rb6RDV",
    secret: "yXGXzhPoYNZgeVofv8mn44NOzkGyUWiz7UG8D9KGIu7T4NSYbv"
  }
});

ServiceConfiguration.configurations.upsert(
  { service: "twitter" },
  {
    $set: {
      consumerKey: Meteor.settings.twitter.consumerKey,
      secret: Meteor.settings.twitter.secret
    }
  }
);
