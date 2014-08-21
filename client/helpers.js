/**
 * Format number with commas and decimals.
 */
UI.registerHelper('timeSince', function(date) {
  Session.get('now');
  if (date) {
    return moment(date).fromNow();
  }
});

/**
 * Format number with commas and decimals.
 */
UI.registerHelper('calendarDate', function(date) {
  moment.lang('sv', {
    weekdays : "måndag_tisdag_onsdag_torsdag_fredag_lördag_söndag".split("_"),
    calendar : {
        lastDay : '[igår]',
        sameDay : 'HH:mm',
        nextDay : '[imorgon]',
        lastWeek : 'dddd',
        nextWeek : 'dddd',
        sameElse : 'YYYY-MM-DD'
    },
    relativeTime : {
      future: "om %s",
      past:   "%s",
      s:  "%d sek",
      m:  "1 min",
      mm: "%d min",
      h:  "1 tim",
      hh: "%d tim",
      d:  "1 dag",
      dd: "%d dag",
      M:  "1 mån",
      MM: "%d mån",
      y:  "1 år",
      yy: "%d år"
    }
  });

  if (date) {
    if (Session.get('now') - date < 3600 * 1000) {
      return moment(date).fromNow();
    }
    return moment(date).calendar();
  }
});

Meteor.startup(function() {
  Meteor.setInterval(function() {
    Session.set('now', (+new Date));
  }, 5000);
});
