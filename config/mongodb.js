'use strict';

var config = {
  //connection info
  'info': {
    'host': 'localhost',
    'port': '27017',
    'db': 'twitter',
  },

  //collection
  'collections': {
    'dm': { name: 'direction_message',
      option: {
        capped: true,
        size: 10485760,
        max: 200
      }
    },
    'tweet': {name: 'tweet'},
    'user': {name: 'user'}
  },

  //build uri
  'uri': function () {
    return 'mongodb://' + this.info.host + ':' + this.info.port + '/' + this.info.db;
  }
}

module.exports = config;