Template.chatroom.helpers({
  avatar: function() {
    return Avatars.findOne({_id: this._avatar});
  },

  green: function(message) {
    return message.replace(/(\*[^*]+\*)/g, '<span class="green">$1</span>');
  }
});

Template.chatrooms.helpers({
  activeAvatars: function() {
    return ActiveRooms.find({_room: this._id}).count();
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
      _user: (Meteor.user() ? Meteor.user()._id : null),
      _avatar: Session.get('avatar'),
      message: message.replace(/[^\w\s*.-_(){}+?!/\\$%&€"'#´`*'¨^:;,0-9@£§|\[\]{}åäö]/gi, ''),
      timestamp: (+new Date),
      _room: Router.current().params.chatroom
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
  }
});

Template.roomForm.events({
  'submit form': function(event, template) {
    event.preventDefault();
    var name = template.find('input').value;
    var _group;
    if (Router.current().params.group) {
      _group = Router.current().params.group;
    }
    else if (Router.current().params.chatroom) {
      var group = Groups.findOne();
      _group = group._id;
    }

    Chatrooms.insert({
      _owner: Meteor.user()._id,
      name: name,
      timestamp: (+new Date),
      _group: _group
    });
  }
});

Template.avatars.helpers({
  avatars: function() {
    return Avatars.find({_user: Session.get('user')});
  },
  avatar: function() {
    var _avatar = Session.get('avatar');
    return Avatars.findOne({_id: _avatar});
  }
});

Template.avatars.events({
  'click li a': function(event, template) {
    event.preventDefault();
    // Remove the avatar from the room when switching.
    var _room = Router.current().params.chatroom;
    var _currentAvatar = Session.get('avatar');
    if (_room && _currentAvatar != this._id) {
      var active = ActiveRooms.findOne({_avatar: Session.get('avatar'), _room: _room});
      if (active) {
        ActiveRooms.remove({_id: active._id});
      }
    }

    Session.set('avatar', this._id);
    Cookie.set('avatar', this._id);
  }
});

Template.avatarForm.events({
  'submit form': function(event, template) {
    event.preventDefault();
    var name = template.find('input').value;
    var _group;
    if (Router.current().params.group) {
      _group = Router.current().params.group;
    }
    else if (Router.current().params.chatroom) {
      var group = Groups.findOne();
      _group = group._id;
    }

    Avatars.insert({
      _owner: (Meteor.user() ? Meteor.user()._id : null),
      name: name,
      timestamp: (+new Date),
      _group: _group,
      _user: Session.get('user')
    });
  }
});

Template.playersInRoom.helpers({
  players: function() {
    var avatars = ActiveRooms.find().fetch();
    if (avatars) {
      var avatarIds = _.pluck(avatars, '_avatar');
      if (avatarIds.length > 0) {
        return Avatars.find({_id: {$in: avatarIds}});
      }
    }
  }
});
