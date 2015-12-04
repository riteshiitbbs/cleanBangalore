Activities = new Mongo.Collection('activities');

Activities.allow({
  insert: function(userId, doc) {
    return doc.userId === userId;
  }
});

Activities.latest = function() {
  return Activities.find({}, {sort: {date: -1}, limit: 1});
}

Meteor.methods({
  createActivity: function(activity, tweet, loc) {
    check(Meteor.userId(), String);
    check(activity, {
      zoneName: String,
      text: String,
      image: String
    });
    check(tweet, Boolean);
    check(loc, Match.OneOf(Object, null));

    activity.userId = Meteor.userId();
    activity.userAvatar = Meteor.user().services.twitter.profile_image_url_https;
    activity.userName = Meteor.user().profile.name;
    activity.date = new Date;
    activity.location = loc;

    if (! this.isSimulation && loc)
      activity.place = getLocationPlace(loc);

    var id = Activities.insert(activity);

    if (! this.isSimulation && tweet)
      tweetActivity(activity);

    return id;
  }
});

if (Meteor.isServer) {
  var twitterOauth = function(options) {
    var config = Meteor.settings.twitter
    var userConfig = Meteor.user().services.twitter;

    return {
      consumer_key: config.consumerKey,
      consumer_secret: config.secret,
      token: userConfig.accessToken,
      token_secret: userConfig.accessTokenSecret
    };
  }

  var tweetActivity = function(activity) {
    // creates the tweet text, optionally truncating to fit the appended text
    function appendTweet(text, append) {
      var MAX = 117; // Max size of tweet with image attached

      if ((text + append).length > MAX)
        return text.substring(0, (MAX - append.length - 3)) + '...' + append;
      else
        return text + append;
    }

    // we need to strip the "data:image/jpeg;base64," bit off the data url
    var image = activity.image.replace(/^data.*base64,/, '');

    var response = HTTP.post(
      'https://upload.twitter.com/1.1/media/upload.json', {
        params: { media: image },
        npmRequestOptions: { oauth: twitterOauth() }
      }
    );

    if (response.statusCode !== 200)
      throw new Meteor.Error(500, 'Unable to post image to twitter');

    if (! response.data)
      throw new Meteor.Error(500, 'Did not receive attachment from twitter');

    var attachment = response.data;

    response = HTTP.post(
      'https://api.twitter.com/1.1/statuses/update.json', {
        params: {
          status: appendTweet(activity.text, ' #cleanBangaloreForSwachhBharat'),
          media_ids: attachment.media_id_string
        },
        npmRequestOptions: { oauth: twitterOauth() }
      }
    );

    if (response.statusCode !== 200)
      throw new Meteor.Error(500, 'Unable to create tweet');
  }

  var getLocationPlace = function(loc) {
    var url = 'https://api.twitter.com/1.1/geo/reverse_geocode.json'
      + '?granularity=neighborhood'
      + '&max_results=1'
      + '&accuracy=' + loc.accuracy
      + '&lat=' + loc.latitude
      + '&long=' + loc.longitude;

    var response = HTTP.get(url,
                            {npmRequestOptions: { oauth: twitterOauth() } });

    if (response.statusCode === 200 && response.data) {
      var place = _.find(response.data.result.places, function(place) {
        return place.place_type === 'neighborhood';
      });

      return place && place.full_name;
    }
  }
}

// Initialize a 1st demo activity
Meteor.startup(function() {
  if (Meteor.isServer && Activities.find().count() === 0) {
    Activities.insert({
      zoneName: 'Kormangala',
      text: 'I saw garbage littered in that area!',
      image: '/img/activity/activity-placeholder.jpg',
      userAvatar: 'https://pbs.twimg.com/profile_images/578616943126519808/G4KveOOw_normal.jpeg',
      userName: 'Ritesh',
      location : {
        latitude : 12.9398938,
        longitude : 77.6289881,
        accuracy : 20
      },
      place: 'Kormangala, bangalore',
      userId: "s7WfuDLy6HrzqxCfL",
      date: new Date
    });
  }
});
