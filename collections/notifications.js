Notifications = new Meteor.Collection('notifications');
UserNotifications = new Meteor.Collection('usernotifications');
RoomSubs = new Meteor.Collection('roomsubs');

if (Meteor.isServer) {
  Meteor.startup(function() {
    if (RoomSubs.find().count() > 0) {
      RoomSubs.remove({});
    }

    if (Notifications.find().count() > 0) {
      Notifications.remove({});
    }

    if (UserNotifications.find().count() > 0) {
      UserNotifications.remove({});
    }

    // // Make a notification get claimed by a current room subscription.
    Notifications.find().observe({
      added: function(notification) {
        var subs = RoomSubs.find({
          listening: true,
          hasFocus: false,
          _room: notification._room,
          _user: {$ne: notification._user}
        });

        var uniqueUserSubs = _.uniq(subs.fetch(), function(sub, key, a) {
          return sub._user;
        });

        _.each(uniqueUserSubs, function(sub) {
          var values = _.extend({_sub: sub._id}, _.omit(notification, '_id'));
          UserNotifications.insert(values);
        });
      }
    });
  });

  // Keep track of user subscriptions as they come in and close.
  Meteor.publish('notifications', function(keys, options) {
    var sub = this;

    if (keys) {
      _.extend(keys, {_id: sub._subscriptionId});
      _.extend(options || {}, keys);
      RoomSubs.upsert(keys, options);
    }

    sub.onStop(function() {
      RoomSubs.remove({_id: sub._subscriptionId});
    });

    return [UserNotifications.find({_sub: sub._subscriptionId}), RoomSubs.find()];
  });
}
else {

  Meteor.startup(function() {
    // Set inital value of focus.
    Session.set('hasFocus', document.hasFocus());
    if (Notification && Notification.permission == 'granted') {
      Session.set('notifications', true);
    }
    else {
      Session.set('notifications', false);
    }

    var flashInterval;
    var i, title = $('title').text();
    var desktopNotifications = [];

    $(window).focus(function() {
      Session.set('hasFocus', true);
      Meteor.clearTimeout(flashInterval);
      document.title = title;

      var oldNotifications = UserNotifications.find().fetch();
      _.each(oldNotifications, function(notification) {
        UserNotifications.remove({_id: notification._id});
      });

      _.each(desktopNotifications, function(notification) {
        notification.close();
      });
      desktopNotifications = [];
    });

    $(window).blur(function() {
      Session.set('hasFocus', false);
    });

    UserNotifications.find().observe({
      added: function(notification) {
        sendNotification(notification);
      }
    });

    function sendNotification(options) {
      if (Notification && Notification.permission == 'granted') {
        var notification = new Notification(options.title, {
          body: options.body
        });

        desktopNotifications.push(notification);

        i = 0;
        Meteor.clearTimeout(flashInterval);

        flashInterval = Meteor.setInterval(function() {
          var count = UserNotifications.find().count();
          document.title = i++ % 2 == 0 ? options.title : '(' + count + ') ' + title;
          if (count == 0) {
            Meteor.clearTimeout(flashInterval);
            document.title = title;
          }
          else if (i > 20) {
            Meteor.clearTimeout(flashInterval);
          }
        }, 1000);

        notification.onclick = function(e) {
          $(window).focus();
          Router.go(options.route);
        }
      }
    }
  });

  Deps.autorun(function() {
    var route = Router.current();

    if (route) {
      Meteor.subscribe('notifications', {
        _user: Session.get('_user') || null,
        _room: route.params._room || null
      }, {
        hasFocus: Session.get('hasFocus'),
        listening: Session.get('notifications')
      });
    }
  });
}
