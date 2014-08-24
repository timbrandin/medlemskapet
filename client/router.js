Router.configure({
  onBeforeAction: function() {
    var user = Cookie.get('user');
    if (!user) {
      user = Meteor.uuid();
      Cookie.set('user', user);
    }
    Session.set('_user', user);
  },
});

var subs = new SubsManager({
  // will be cached only 20 recently used subscriptions
  cacheLimit: 20,
  // any subscription will be expired after 5 minutes of inactivity
  expireIn: 60 * 8
});

Router.map(function() {

  this.route('chatroom', {
    path: '/room/:_room',
    waitOn: function() {
      var group = Groups.findOne();
      if (group) {
        subs.subscribe('chatrooms', group._id);
        subs.subscribe('avatars', group._id);
      }
      return subs.subscribe('messages', this.params._room, Session.get('avatar'));
    },
    onAfterAction: function() {
      var scroll = Session.get(['scroll' + this.params._room]) || 0;

      Meteor.setTimeout(function() {
        $(window).scrollTop(scroll);
      }, 0);
    },
    data: function() {
      var room = Chatrooms.findOne({_id: this.params._room});

      if (room) {
        return {
          messages: Messages.find({_room: this.params._room}, {sort: {timestamp: 1}}),
          rooms: Chatrooms.find({}, {sort: {name: 1}}),
          room: room,
          group: Groups.findOne({_id: room._group})
        };
      }
    },
    onStop: function() {
      Session.set(['scroll' + this.params._room].join('_'), $(window).scrollTop());
    }
  });

  this.route('chatrooms', {
    path: '/:_group',
    template: 'chat',
    waitOn: function() {
      subs.subscribe('avatars', this.params._group);
      return subs.subscribe('chatrooms', this.params._group);
    },
    data: function() {
      return {
        rooms: Chatrooms.find({_group: this.params._group}, {sort: {name: 1}}),
        group: Groups.findOne({_id: this.params._group})
      };
    }
  });

  this.route('home', {
    path: '/',
    waitOn: function() {
      return subs.subscribe('groups');
    },
    data: function() {
      return {groups: Groups.find({}, {sort: {name: 1}})};
    }
  });
});
