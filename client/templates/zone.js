var TAB_KEY = 'zoneShowTab';

Template.zone.onCreated(function() {
  if (Router.current().params.activityId)
    Template.zone.setTab('feed');
  else
    Template.zone.setTab('zone');
});

Template.zone.onRendered(function () {
  this.$('.zone').touchwipe({
    wipeDown: function () {
      if (Session.equals(TAB_KEY, 'zone'))
        Template.zone.setTab('make')
    },
    preventDefaultEvents: false
  });
  this.$('.attribution-zone').touchwipe({
    wipeUp: function () {
      if (! Session.equals(TAB_KEY, 'zone'))
        Template.zone.setTab('zone')
    },
    preventDefaultEvents: false
  });
});

// CSS transitions can't tell the difference between e.g. reaching
//   the "make" tab from the expanded state or the "feed" tab
//   so we need to help the transition out by attaching another
//   class that indicates if the feed tab should slide out of the
//   way smoothly, right away, or after the transition is over
Template.zone.setTab = function(tab) {
  var lastTab = Session.get(TAB_KEY);
  Session.set(TAB_KEY, tab);

  var fromZone = (lastTab === 'zone') && (tab !== 'zone');
  $('.feed-scrollable').toggleClass('instant', fromZone);

  var toZone = (lastTab !== 'zone') && (tab === 'zone');
  $('.feed-scrollable').toggleClass('delayed', toZone);
}

Template.zone.helpers({
  isActiveTab: function(name) {
    return Session.equals(TAB_KEY, name);
  },
  activeTabClass: function() {
    return Session.get(TAB_KEY);
  },
  bookmarked: function() {
    return Meteor.user() && _.include(Meteor.user().bookmarkedZoneNames, this.name);
  },
  activities: function() {
    return Activities.find({zoneName: this.name}, {sort: {date: -1}});
  }
});

Template.zone.events({
  'click .js-add-bookmark': function(event) {
    event.preventDefault();

    if (! Meteor.userId())
      return Overlay.open('authOverlay');

    Meteor.call('bookmarkZone', this.name);
  },

  'click .js-remove-bookmark': function(event) {
    event.preventDefault();

    Meteor.call('unbookmarkZone', this.name);
  },

  'click .js-show-zone': function(event) {
    event.stopPropagation();
    Template.zone.setTab('make')
  },

  'click .js-show-feed': function(event) {
    event.stopPropagation();
    Template.zone.setTab('feed')
  },

  'click .js-uncollapse': function() {
    Template.zone.setTab('zone')
  },

  'click .js-share': function() {
    Overlay.open('shareOverlay', this);
  }
});
