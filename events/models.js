/**
 * Set up database connection to use
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var config = require('../config.js');

//Connect to the database
if(!config.noDB){
	mongoose.connect('mongodb://'+config.db_host+':'+config.db_port+'/'+config.db_collection);
	console.log('Connected to '+config.db_host+':'+config.db_port+'/'+config.db_collection);
};

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
	email	: { type: String, lowercase:true, required: true, index: {unique: true, sparse: true}},
	
});

var CommentSchema = new Schema({
	eventID		:	ObjectId,
	userID		: 	ObjectId,
	text		:	{type: String, required:true},
	timestmp	:	{type: Date, default: Date.now},
	latitude	:	{type: Number, select: false},
	longitude	: 	{type: Number, select: false}
});

var LocationSchema = new Schema({
	name		:	{type: String, required:true},
	latitude	:	{type: Number, required:true},
	longitude	:	{type: Number, required: true},
	radius		:	{type: Number, required: true}
});

var ContactSchema = new Schema({
	name		:	{type: String, required:true},
	email		:	{type: String, required:true},
	phone		:	{type: String, required:true}
});

var EventSchema = new Schema({
	GID			:	{type: Number, min:0, required:true},
	timestmp	:	{type: Date, default: Date.now},
	title		:	{type: String, required:true},
	type		:	{type: String, enum: config.eventTypes, required:true},
	group		:	{type: Number, required:true},
	status		:	{type: String, enum: ['Ongoing', 'Closed'], required:true},
	userID		:	ObjectId,
	description	:	{type: String, required:true},
	radius		:	Number,
	comments	:	{type: [CommentSchema]},
	location	:	{type: ObjectId, ref: 'Location', required:true},
	contact		:	{type: ObjectId, ref: 'Contacts', required:true}
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