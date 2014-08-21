/**
 * Format number with commas and decimals.
 */
UI.registerHelper('timeSince', function(date) {
  Session.get('now');
  if (date) {
    return moment(date).fromNow();
  }
});

Meteor.startup(function() {
  Meteor.setInterval(function() {
    Session.set('now', (+new Date));
  }, 30000);
});
