Chatrooms = new Meteor.Collection('chatrooms');

if (Meteor.isServer) {
  Meteor.publish('chatrooms', function(_group) {
    var group = Groups.find({_id: _group});
    var rooms = Chatrooms.find({_group: _group});
    return [group, rooms];
  });
}
