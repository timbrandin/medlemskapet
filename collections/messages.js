Messages = new Meteor.Collection('messages');

if (Meteor.isServer) {
  Meteor.publish('messages', function(_chatroom, _avatar) {
    var roomCursor = Chatrooms.find({_id: _chatroom});
    var room = Chatrooms.findOne({_id: _chatroom});

    if (room) {
      var groupCursor = Groups.find({_id: room._group});
      var messagesCursor = Messages.find({_room: room._id}, {sort: {timestamp: 1}, limit: 100});

      if (_avatar) {
        Meteor.call('tickActive', _avatar, room._id);
      }

      return [roomCursor, groupCursor, messagesCursor];
    }
  });
}
