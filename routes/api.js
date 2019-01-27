/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var ThreadHandler = require('../controllers/threadHandler.js');
var ReplyHandler = require('../controllers/replyHandler.js');

module.exports = function (app) {
  
  let threadHandler = new ThreadHandler();
  let replyHandler = new ReplyHandler();
  
  app.route('/api/threads/:board')
    .get(threadHandler.showThreads)
    .post(threadHandler.newThread)
    .put(threadHandler.reportThread)
    .delete(threadHandler.deleteThread);
    
  app.route('/api/replies/:board')
    .get(replyHandler.showReplies)
    .post(replyHandler.newReply)
    .put(replyHandler.reportReply)
    .delete(replyHandler.deleteReply);

};
