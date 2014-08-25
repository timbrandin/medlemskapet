Template.chat.helpers({
  activeAvatars: function() {
    var activeAvatarTabs = ActiveUserTabs.find({_room: this._id, _avatar: {$not: null}}).fetch();
    var activeAvatars = _.uniq(_.pluck(activeAvatarTabs, '_avatar'));

    return activeAvatars.length;
  },

  activeUsers: function() {
    var activeUserTabs = ActiveUserTabs.find({_room: this._id, _avatar: null}).fetch();
    var activeUsers = _.uniq(_.pluck(activeUserTabs, '_user'));

    return activeUsers.length;
  },

  avatar: function() {
    var _avatar = Session.get('avatar');
    return Avatars.findOne({_id: _avatar});
  }
});

Template.messages.helpers({
  avatar: function() {
    var avatar = Avatars.findOne({_id: this._avatar});
    return avatar ? avatar : (this.avatarName ? {name: this.avatarName} : '');
  },

  localTime: function() {
    return this.timestamp - TimeSync.serverOffset();
  },

  filter: function(message) {
    return message
      // Make URLs to links.
      .replace(/(https?:\/\/?[\da-z\.-]+\.[a-z\.]{2,6}(?:[\/\w\.\-%]*)*\/?(?:\?[^\s]*)?)/ig, '<a href="$1" target="_blank">$1</a>')
      // Make ** in green color.
      .replace(/(\*[^*]+\*)/g, '<span class="green">$1</span>');
  }
});

Template.logout.events({
  'click a': function(e, t) {
    e.preventDefault();
    Session.set('avatar', null);
  }
});

Template.notifications.events({
  'click a': function(e, t) {
    e.preventDefault();

    Notification.requestPermission();

    Session.set('notifications', !Session.get('notifications'));
  }
});

Template.notifications.helpers({
  'listening': function() {
    return Session.get('notifications');
  }
});

Template.chatrooms.helpers({
  activeAvatarsCount: function() {
    var activeAvatarTabs = ActiveUserTabs.find({_room: this._id, _avatar: {$not: null}}).fetch();
    var activeAvatars = _.uniq(_.pluck(activeAvatarTabs, '_avatar'));

    return activeAvatars.length;
  },

  activeUsers: function() {
    var activeUserTabs = ActiveUserTabs.find({_room: this._id, _avatar: null}).fetch();
    var activeUsers = _.uniq(_.pluck(activeUserTabs, '_user'));

    return activeUsers.length;
  },

  activeAvatars: function() {
    var avatars = ActiveUserTabs.find({_room: this._id}, {fields: {_avatar: 1}}).fetch();
    if (avatars) {
      var _avatars = _.pluck(avatars, '_avatar');
      return Avatars.find({_id: {$in: _avatars}});
    }
  },

  avatar: function() {
    var _avatar = Session.get('avatar');
    return Avatars.findOne({_id: _avatar});
  }
});

Template.messageForm.helpers({
  avatar: function() {
    var _avatar = Session.get('avatar');
    return Avatars.findOne({_id: _avatar});
  }
});

Template.messageForm.events({
  'submit form': function(event, template) {
    event.preventDefault();
    var message = template.find('textarea').value;

    Messages.insert({
      _user: Session.get('_user'),
      _avatar: Session.get('avatar'),
      message: message.replace(/[^\w\s*.\-_(){}+=?!/\\$%&€"'#´`*'¨^:;,0-9@£§|\[\]{}åäö]/gi, ''),
      timestamp: TimeSync.serverTime(),
      _room: Router.current().params._room
    });

    // Clear the textarea.
    template.find('textarea').value = '';
    template.find('textarea').focus();
  }
});

Template.groupForm.events({
  'submit form': function(event, template) {
    event.preventDefault();
    var name = template.find('input').value;
    Groups.insert({
      _owner: Meteor.user()._id,
      name: name,
      timestamp: (+new Date)
    });

    // Clear the input.
    template.find('input').value = '';
  }
});

Template.roomForm.events({
  'submit form': function(event, template) {
    event.preventDefault();
    var name = template.find('input').value;
    var _group;
    if (Router.current().params._group) {
      _group = Router.current().params._group;
    }
    else if (Router.current().params._room) {
      var group = Groups.findOne();
      _group = group._id;
    }

    Chatrooms.insert({
      _owner: Meteor.user()._id,
      name: name,
      timestamp: (+new Date),
      _group: _group
    });

    // Clear the input.
    template.find('input').value = '';
  }
});

Template.avatars.helpers({
  avatars: function() {
    if (Meteor.user()) {
      return Avatars.find({$or: [{_user: Session.get('_user')}, {_owner: Meteor.user()._id}]});
    }
    else {
      return Avatars.find({_user: Session.get('_user')});
    }
  },
  avatar: function() {
    var _avatar = Session.get('avatar');
    return Avatars.findOne({_id: _avatar});
  }
});

Template.avatars.events({
  'click li a': function(event, template) {
    event.preventDefault();
    Session.set('avatar', this._id);
  },

  'click .remove': function() {
    Avatars.remove({_id: this._id});
  }
});

Template.avatarForm.events({
  'submit form': function(event, template) {
    event.preventDefault();
    var name = template.find('input').value;
    var _group;
    if (Router.current().params._group) {
      _group = Router.current().params._group;
    }
    else if (Router.current().params._room) {
      var room = Chatrooms.findOne({_id: Router.current().params._room});
      _group = room._group;
    }

    Avatars.insert({
      _owner: (Meteor.user() ? Meteor.user()._id : null),
      name: name,
      timestamp: (+new Date),
      _group: _group,
      _user: Session.get('_user')
    });

    // Clear the input.
    template.find('input').value = '';
  }
});

Template.playersInRoom.helpers({
  players: function() {
    var avatars = ActiveUserTabs.find().fetch();
    if (avatars) {
      var avatarIds = _.pluck(avatars, '_avatar');
      if (avatarIds.length > 0) {
        return Avatars.find({_id: {$in: avatarIds}});
      }
    }
  }
});
