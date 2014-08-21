Groups = new Meteor.Collection('groups');

if (Meteor.isServer) {
  Meteor.publish('groups', function() {
    return Groups.find();
  });
}
