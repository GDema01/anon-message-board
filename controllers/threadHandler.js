const mongo = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const CONNECTION_STRING = process.env.DB;

function ThreadHandler() {
  
  this.showThreads = function(req, res) {
    let board = req.params.board;
    
    mongo.connect(CONNECTION_STRING, (err, database) => {
      let db = database.db('fccdatabase');
      db.collection(board).find({},
        {limit: 10, sort: {bumped_on: -1}, projection: {reported: 0, delete_password: 0, "replies.delete_password": 0, "replies.reported": 0}})
      .toArray((err, docs) => {
        docs.forEach((doc) => {
          if (doc.replies.length > 3) {
            doc.replies = doc.replies.slice(-3);
          }
        });
        res.json(docs);
      });
    })
  };
  
  this.newThread = function(req, res) {
    let board = req.params.board;
    let thread = {
      text: req.body.text,
      created_on: new Date(),
      bumped_on: new Date(),
      reported: false,
      delete_password: req.body.delete_password,
      replies: []
    };
    
    mongo.connect(CONNECTION_STRING, (err, database) => {
      let db = database.db('fccdatabase');

      db.collection(board).insertOne(thread, (err, data) => {
        if (err) {console.log('error saving to db' + err);}
        console.log('saved succesfully')
        res.redirect('/b/' + board + '/');
      });
    });
    
  }
  
  this.reportThread = function(req, res) {
    let board = req.params.board;
    
    mongo.connect(CONNECTION_STRING, (err, database) => {
      let db = database.db('fccdatabase');
      
      db.collection(board).findOneAndUpdate({_id: new ObjectId(req.body.thread_id)}, {$set: {reported: true}}, (err, data) => {
        if(data.value) {res.send('reported')}
      });
    });
  }
  
  this.deleteThread = function(req, res) {
    let board = req.params.board
    
    mongo.connect(CONNECTION_STRING, (err, database) => {
      let db = database.db('fccdatabase');
      
      db.collection(board).findOneAndDelete({_id: new ObjectId(req.body.thread_id), delete_password: req.body.delete_password}, (err, data) => {
        if (!data.value) {
          res.send('incorrect password');
        } else {
          res.send('success');
        }
      });
    });
  }
  
}

module.exports = ThreadHandler;