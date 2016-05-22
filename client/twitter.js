'use strict';

//load twitter 
var token = require('../config/twitter');
var Twitter = require('twitter');

var twitterClient = new Twitter({
  consumer_key: token.consumer_key,
  consumer_secret: token.consumer_secret,
  access_token_key: token.access_token_key,
  access_token_secret: token.access_token_secret
});

module.exports = twitterClient;