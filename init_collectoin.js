'use strict';
var co = require('co');

// mongo
var config = require('./config/mongodb');
var MongoClient = require('mongodb').MongoClient;

//iniitail collections
var collections = config.collections;


//==========================================
// start
//==========================================
co(function* () {

  var db = yield MongoClient.connect(config.uri());

  // collections is the normal object, 
  // dont use (for let collection of collections) to iterator each item
  for (let index in collections) 
  {
    let colleciton = collections[index];
    yield init_collection(db, colleciton);
  }

  db.close();
})
.catch(function (error) {
  console.log(error);
});

//==========================================
//
//==========================================
function init_collection (db, colleciton)
{
  var name = colleciton.name
  var option = (undefined == colleciton.option) ? {} : colleciton.option;
  var capped = (undefined == option.capped) ? false : option.capped;

  return new Promise (function (resolve, reject) {

    co(function* () {
            
      //test if collection exists
      try {
        yield db.dropCollection(name);
        console.log(name +' droped.');
      }
      catch (error) {
        console.log(name +' not exists, create it now.');
      }

      //create collection
      try {
        
        let status = 'success';
        let createedCollection = yield db.createCollection(name, option);
        
        //need create index ?
        if (undefined !== option.index)
        {
          if (undefined == option.index.options)
          {
            option.index.options = {};
          }

          let createdIndex = yield db.collection(name).createIndex(option.index, option.index.options);
        }

        // test collection is capped or not
        if (capped)
        {
          let capped = yield createedCollection.isCapped();
          status = (true === capped) ? 'with capped success' : 'with capped fail';  
        }
        console.log(name +' create ' + status + '.');
      }
      catch (error) {
        console.log(name +' create fail.');
        reject(error);
      }      
    
      resolve(this);      

    })
    .catch(function (error) {
      reject(error)
    });
  
  }); 
};