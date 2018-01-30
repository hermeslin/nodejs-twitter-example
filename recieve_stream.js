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

  //begin twitter stream
  twitterClient.stream('user', function startStream (stream) {

    console.log('streaming....');

    //when recieve stream succcess
    stream.on('data', function(response) {
      var dm = response.direct_message;

      if (undefined !== dm)
      {
        //store direction message
        co(function *() {

          let currentDate = new Date();
          let aHourAgo = currentDate.getTime() - (60 * 60 * 1000) - currentDate.getTimezoneOffset();

          let query = {
            'sender_id': dm.sender_id,
            'created_at_date_obj': {$gte: new Date(aHourAgo)}
          };

          let options = {
            sort: {
              'created_at': -1
            }
          };

          let find = yield db.collection(config.collections.dm.name).findOne(query, options);
          if (!find)
          {
            let document = {
              'id': dm.id,
              'id_str': dm.id_str,
              'sender_id': dm.sender_id,
              'sender_id_str': dm.sender_id_str,
              'sender_screen_name': dm.sender_screen_name,
              'text': dm.text,
              'created_at': dm.created_at,
              'time_zone': dm.sender.time_zone,
              'lang' :dm.sender.lang,
              'entities': dm.entities,
              'created_at_date_obj': new Date(dm.created_at),
            };

            yield db.collection(config.collections.dm.name).insertOne(document);
            console.log('insert into '+config.collections.dm.name+' collection with text: '+document.text);
          }
          else
          {
            console.log('user has tweeted twice in ONE HOUR.');
          }
        })
        .catch(function (error) {
          console.log(error);
        });

        //store user data
        co(function *() {

          let query = {'id': dm.sender_id};
          let options = {
              new: false,
              remove: false,
              upsert: true
          };

          let success = yield db.collection(config.collections.user.name).findAndModify(query, false, dm.sender, options);
          if (success)
          {
            console.log('modify success: '+dm.sender_id)
          }
        })
        .catch(function (error) {
          console.log('can not modify user collection');
          console.log(error);
        });
      }

    });

    //when recieve stream error
    stream.on('error', function(error) {
      console.log(error);
      db.close();
    });

  }); //end twitter stream

})
.catch(function (error) {
  console.log(error);
});