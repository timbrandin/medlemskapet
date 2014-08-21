Router.configure({
  onBeforeAction: function() {
    var user = Cookie.get('user');
    if (!user) {
      user = Meteor.uuid();
      Cookie.set('user', user);
    }
    Session.set('user', user);

    var _avatar = Cookie.get('avatar');
    if (_avatar) {
      Session.set('avatar', _avatar);
    }
  },
});

Router.map(function() {

  this.route('chatroom', {
    path: '/room/:chatroom',
    waitOn: function() {
      var group = Groups.findOne();
      if (group) {
        Meteor.subscribe('chatrooms', group._id);
        Meteor.subscribe('activerooms', group._id);
        Meteor.subscribe('avatars', group._id);
      }
      return Meteor.subscribe('messages', this.params.chatroom, Session.get('avatar'));
    },
    data: function() {
      return {
        messages: Messages.find({_room: this.params.chatroom}, {sort: {timestamp: 1}}),
        rooms: Chatrooms.find({}, {sort: {name: 1}}),
        room: Chatrooms.findOne({_id: this.params.chatroom}),
        group: Groups.findOne()
      };
    },
    onStop: function() {
      var avatar = ActiveRooms.findOne({_avatar: Session.get('avatar'), _room: this.params.chatroom});
      if (avatar) {
        ActiveRooms.remove({_id: avatar._id});
      }
    }
  });

  this.route('chatrooms', {
    path: '/:group',
    template: 'chat',
    waitOn: function() {
      Meteor.subscribe('avatars', this.params.group);
      Meteor.subscribe('activerooms', this.params.group);
      return Meteor.subscribe('chatrooms', this.params.group);
    },
    data: function() {
      return {
        rooms: Chatrooms.find({}, {sort: {name: 1}}),
        group: Groups.findOne()
      };
    }
  });

  this.route('groupLogin', {
    path: '/:group/login'
  });



  this.route('home', {
    path: '/',
    waitOn: function() {
      return Meteor.subscribe('groups');
    },
    data: function() {
      return {groups: Groups.find({}, {sort: {name: 1}})};
    }
  });
});
