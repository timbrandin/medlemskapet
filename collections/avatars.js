Avatars = new Meteor.Collection('avatars');

if (Meteor.isServer) {

  Meteor.startup(function() {
    // Ensure we have a unique set.
    Avatars._ensureIndex({"name": 1, "_group": 1}, {unique: true, dropDups: true});

    Avatars.find().observe({
      removed: function(avatar) {
        Messages.update({_avatar: avatar._id}, {$set: {avatarName: avatar.name}}, {multi: true});
      }
    });
  });

  Meteor.methods({
    resetAvatars: function() {
      Avatars.remove({});
    }
  });

  Meteor.publish('avatars', function(_group) {
    if (_group) {
      return Avatars.find({_group: _group});
    }
  });
}
