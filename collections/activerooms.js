ActiveRooms = new Meteor.Collection('activerooms');

if (Meteor.isServer) {
  // Ensure we have a unique set of emails.
  ActiveRooms._ensureIndex({"_avatar": 1, "_room": 1}, {unique: true, dropDups: true});

  Meteor.publish('activerooms', function(_group) {
    return ActiveRooms.find({_group: _group});
  });

  // Meteor.startup(function() {
  //   ActiveRooms.find().observe({
  //     added: function(doc) {
  //       var avatar = Avatars.findOne({_id: doc._avatar});
  //       var room = Chatrooms.findOne({_id: doc._room});
  //       if (avatar && room) {
  //         Messages.insert({
  //           _room: doc._room,
  //           message: avatar.name + ' kom in.',
  //           system: true,
  //           timestamp: (+new Date)
  //         });
  //       }
  //     },
  //     removed: function(doc) {
  //       var avatar = Avatars.findOne({_id: doc._avatar});
  //       var room = Chatrooms.findOne({_id: doc._room});
  //       if (avatar && room) {
  //         Messages.insert({
  //           _room: doc._room,
  //           message: avatar.name + ' gick ut.',
  //           system: true,
  //           timestamp: (+new Date)
  //         });
  //       }
  //     }
  //   });
  // });

  Meteor.methods({
    'tickActive': function(_avatar, _room) {
      var room = Chatrooms.findOne({_id: _room});
      if (room) {

        ActiveRooms.upsert({
          _avatar: _avatar,
          _room: _room
        }, {$set:
          {
            timestamp: (+new Date),
            _group: room._group
          }
        });
      }

    },
    'logoutAvatar': function(_avatar) {
      if (_avatar) {
        ActiveRooms.remove({_avatar: _avatar});
      }
    }
  });

  Meteor.setInterval(function() {
    ActiveRooms.remove({timestamp: {$lt: ((+new Date) - 60000)}});
  }, 60 * 1000);
}
else {
  Meteor.setInterval(function() {
    var _room = Router.current().params.chatroom;

    if (Session.get('avatar') && _room) {
      Meteor.call('tickActive', Session.get('avatar'), _room);
    }
  }, 60 * 1000);
}
