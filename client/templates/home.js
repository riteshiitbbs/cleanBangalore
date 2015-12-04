var FEATURED_COUNT = 4;

Template.home.helpers({
  // selects FEATURED_COUNT number of zones at random
  featuredZones: function() {
    var zones = _.values(ZonesData);
    var selection = [];

    for (var i = 0;i < FEATURED_COUNT;i++)
      selection.push(zones.splice(_.random(zones.length - 1), 1)[0]);

    return selection;
  },

  activities: function() {
    return Activities.latest();
  },

  latestNews: function() {
    return News.latest();
  }
});