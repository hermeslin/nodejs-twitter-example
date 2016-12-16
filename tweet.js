'use strict';
var co = require('co');

//twitter
var twitterClient = require('./client/twitter');

// // mongo
var config = require('./config/mongodb');
var MongoClient = require('mongodb').MongoClient;

//==========================================
// start
//==========================================
co(function* () {
  
  var db = yield MongoClient.connect(config.uri());

  let cursorOptions = {
    tailable: true,
    awaitdata: true,
    numberOfRetries: -1 
  };

  var stream = db.collection(config.collections.dm.name).find({}, cursorOptions).stream();  
  console.log('recieving document from capped collection..');

  //rescieve first document and tweet it
  stream.on('data', function (document) {
    
    // stream
    co(function *(){
      
      let twitterId = document.id;
      
      //check this tweet has sent before or not
      let find = yield db.collection(config.collections.tweet.name).findOne({
        id: twitterId, 
      });

      if (find)
      {
        console.log('twitter_id: '+ twitterId + ' has sent before.');
        return; 
      }

      //send tweet
      let afterPost = yield twitterPost(document.text);
      
      //store tweet
      delete document._id;
      let insertSuccess = yield db.collection(config.collections.tweet.name).insertOne(document);

      console.log('all success: ' + twitterId + ', ' + document.text);
    })
    .catch(function (error) {
      console.log(error);
    });
  });
  
  //if get error from capped collection
  stream.on('error', function (error) {
    console.log(error.message);
    db.close(); 
  });

})
.catch(function (error){
  console.log(error);
});

//==========================================
// titter post
//==========================================
function twitterPost (text) { 
  return new Promise (function (resolve, reject){
    twitterClient.post('statuses/update', {status: text}, function (error, tweet, response){
      if (!error) 
      {
        resolve(response);
      }
      else
      {
        reject(error);
      }
    });
  });
};
