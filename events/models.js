/**
 * Set up database connection to use
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var config = require('../config.js');
var winston = require('winston');

//Connect to the database
if(!config.noDB){
	mongoose.connect('mongodb://'+config.db_host+':'+config.db_port+'/'+config.db_collection);
};

//Load and set up the logger
var logger = new (winston.Logger)({
	//Make it log to both the console and a file 
	transports : [new (winston.transports.Console)(),
	              new (winston.transports.File)({filename: 'logs/general.log'})],
});

/**
 * Define the models
 */
//For less typing

var ObjectId = Schema.ObjectId;

//Define basic first
var UserSchema = new Schema({
	name	: {
			first	: String,
			last	:	String
			},
	email	: { type: String, required: true, index: {unique: true, sparse: true}},
	
});

var CommentSchema = new Schema({
	eventID		:	ObjectId,
	userID		: 	ObjectId,
	text		:	String,
	timestmp	:	{type: Date, default: Date.now},
	latitude	:	{type: Number, select: false},
	longitude	: 	{type: Number, select: false}
});

var LocationSchema = new Schema({
	name		:	String,
	latitude	:	Number,
	longitude	:	Number,
	radius		:	Number
});

var ContactSchema = new Schema({
	name		:	String,
	email		:	String,
	phone		:	String
});

var EventSchema = new Schema({
	GID			:	Number,
	timestmp	:	{type: Date, default: Date.now},
	title		:	String,
	type		:	{type: String, enum: config.eventTypes },
	group		:	Number,
	status		:	{type: String, enum: ['Ongoing', 'Closed']},
	userID		:	ObjectId,
	description	:	String,
	radius		:	Number,
	comments	:	{type: [CommentSchema]},
	location	:	{type: ObjectId, ref: 'Location'},
	contact		:	{type: ObjectId, ref: 'Contacts'}
});

//Virtual method to get the number of comments
EventSchema.virtual('numComments').get(function(){
	return this.comments.length;
});

var ReportSchema = new Schema({
	description	:	String,
	type		:	{type: String, enum: ['Emergency', 'Warning', 'Weather', 'Traffic'] },
	location	:	ObjectId,
	submitter	:	ObjectId,
	timestmp	:	{type: Date, default: Date.now},
	reviewer	:	ObjectId,
	status		:	{type: String, enum: ['Valid', 'Invalid']},
	reviewComment	:	String,
	reviewTimestmp	:	Date,
	event		:	ObjectId
});

/**
 * Set the models up
 */
this.comment = mongoose.model('Comment', CommentSchema);
this.location = mongoose.model('Location', LocationSchema);
this.contact = mongoose.model('Contacts', ContactSchema);
this.event = mongoose.model('Event', EventSchema);

/**
 * At this point, creating new data should be as easy as:
 * var newEvent = new event();
 * newEvent.title = 'Test'
 * newEvent.save(function(err) {});
 * 
 * Finding events is as easy as:
 * event.find({id:1}, function(err, docs){
 * 		//docs contains all Events with a matching id
 * });
 * More: http://mongoosejs.com/docs/finding-documents.html
 * 
 */