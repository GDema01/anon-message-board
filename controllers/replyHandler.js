const mongo = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const CONNECTION_STRING = process.env.DB;

function ReplyHandler() {
  this.showReplies = function(req, res) {
    let board = req.params.board;
    let thread_id = req.query.thread_id;
    
    mongo.connect(CONNECTION_STRING, (err, database) => {
      let db = database.db('fccdatabase');
      
      db.collection(board).findOne({_id: new ObjectId(thread_id)},
                                   {projection: {reported: 0, delete_password: 0, "replies.delete_password": 0, "replies.reported": 0}},
                               (err, doc) => {
        if (err) throw err;
        res.send(doc)
      })
      
    });
  };
  
  this.newReply = function(req, res) {
    let board = req.params.board;
    
    mongo.connect(CONNECTION_STRING, (err, database) => {
      let db = database.db('fccdatabase');
      
      let reply = {
        _id: new ObjectId(),
        text: req.body.text,
        created_on: new Date(),
        delete_password: req.body.delete_password,
        reported: false
      }
      
      db.collection(board).findOneAndUpdate({_id: new ObjectId(req.body.thread_id)},
                                            {$set: {bumped_on: new Date()}, $push: {replies: reply}}, 
                                            (err, data) => {
        res.redirect('/b/' + board + '/' + req.body.thread_id);
      })
      
    });
  }
  
  this.reportReply = function(req, res) {
    let board = req.params.board;
    
    mongo.connect(CONNECTION_STRING, (err, database) => {
      let db = database.db('fccdatabase');
      
      db.collection(board).findOneAndUpdate({_id: new ObjectId(req.body.thread_id), replies: {$elemMatch: {_id: new ObjectId(req.body.reply_id)}} },
                                            {$set: {"replies.$.reported": true}},
                                           (err, data) => {
        if(data.value) {res.send('reported')}
      });
    });
  }
  
  this.deleteReply = function(req, res) {
    let board = req.params.board;
    let thread_id = req.body.thread_id;
    let reply_id = req.body.reply_id;
    let delete_password = req.body.delete_password
    
    mongo.connect(CONNECTION_STRING, (err, database) => {
      let db = database.db('fccdatabase');
      
      db.collection(board).findOneAndUpdate({_id: new ObjectId(thread_id), 
                                             replies: {$elemMatch: {_id: new ObjectId(reply_id), delete_password: delete_password}} },
                                            {$set: {"replies.$.text": "[deleted]"}}, (err, data) => {
        if(err) throw err;
        if(!data.value) {
          res.send('incorrect password');
        } else {
          res.send('success');
        }
      })
    });
  }
  
}

module.exports = ReplyHandler;