Template.zoneItem.helpers({
  path: function () {
    return Router.path('zone', this.zone);
  },

  highlightedClass: function () {
    if (this.size === 'large')
      return 'highlighted';
  }
});