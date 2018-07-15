'use strict';

const logger = require('./logger');
const url = "mongodb://localhost:27017/mydb";
var mongoose = require('mongoose');
var Conversation = require('./models/conversation');
var answer = require('./models/answer');
mongoose.connect(url);

module.exports.saveMessage = function (conversation) {
	var conv = new Conversation({
		chat_id: conversation.socketId,
		message_id: conversation.messageId,
		request: conversation.query,
		response: conversation.message,
		feedback: true,
		trained: false,
		created_at: new Date()
	});
	conv.save();
	console.log("conversation saved using mongoose");
};

module.exports.saveFeedback = function (messageId, feedback) {
	Conversation.update({ 'message_id': messageId }, {
		'feedback': feedback
	}, function (err, numberAffected, rawResponse) {
		console.log(numberAffected);
	});
};

module.exports.getTrainedQnA = function (callback) {
	Conversation.find({ 'trained': false }, function (err, conversations) {
		// console.log(conversations);		
		return callback(null, conversations);
	});

};

module.exports.getAnswer = function (pIntent, callback) {	
	answer.findOne({ 'Intent': pIntent }, function (err, doc) {
		if (err) {
			throw err;
		}
		callback(doc.Answer);
	});	
};