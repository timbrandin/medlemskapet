ActiveUserTabs = new Meteor.Collection('activeusertabs');

if (Meteor.isServer) {

  Meteor.startup(function() {
    if (ActiveUserTabs.find().count() > 0) {
      ActiveUserTabs.remove({});
    }
  });

  Meteor.publish('activeusertabs', function(options) {
    var sub = this;

    // Extend passed subscription details.
    var activeUserTab = _.extend({
      _id: sub._subscriptionId,
      _owner: sub.userId || null
    }, options || {});

    ActiveUserTabs.upsert({_id: sub._subscriptionId}, activeUserTab);

    sub.onStop(function() {
      ActiveUserTabs.remove({_id: sub._subscriptionId});
    });

    return ActiveUserTabs.find({_group: options._group});
  });

}
else {
  Deps.autorun(function() {
    var route = Router.current();

    if (route) {
      var group = Groups.findOne();

      if (group) {
        Meteor.subscribe('activeusertabs', {
          _user: Session.get('_user') || null,
          _avatar: Session.get('avatar') || null,
          _room: route.params._room || null,
          _group: group._id || null
        });
      }
    }
  });
}
