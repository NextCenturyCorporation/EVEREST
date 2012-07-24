/**
 * All the data to be posted, stored as an array of objects, in sequence.
 * Data based from this page:
 * http://blog.chron.com/newswatch/2011/12/new-shooting-at-virginia-tech/
 */

/*
{
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
}
 */

this.contact = {
		name:"Police",
		phone:"911",
		email:"police@vt.edu"
};

this.location = {
		name:"Virginia Tech",
		latitude: 37.227774,
		longitude:-80.422133,
		radius: 1000
};

//Common default data, to be added to each element before returning
var defaults = {
		GID:1, type:"Emergency", status:"Ongoing", group:0, radius:1000
};

var baseDate = '08 Dec, 2011 ';

var data = [
{title:"Gun shots reported", timestmp: new Date(baseDate+'13:24:00'), description:
	"Gun shots reported- Coliseum Parking lot. Stay Inside. Secure doors. Emergency personnel responding. Call 911 for help."}, //1:24pm
{title:"Suspect Description", timestmp: new Date(baseDate+'13:24:59'), description:
	"Suspect described as white male, gray sweat pants, gray hat w/neon green brim, maroon hoodie and backpack. On foot towards McComas."}, //1:24pm
{title:"Suspect remains at large", timestmp: new Date(baseDate+'13:30:00'), description:
	"Suspect remains at large. A police officer has been shot. A potential second victim is reported at the Cage lot. Stay indoors. Secure in place."}, //1:30pm
{title:"Police officer dead", timestmp: new Date(baseDate+'13:40:00'), description:
	"A police officer is dead in the Cassel Coliseum lot, near McComas Hall. A person was shot at, but their status is unknown, in the I lot off"+
	"Plantation Road near the Duck Pond. A potential second victim was identified via VT Alerts in the Cage lot. However, the suspect is still at large."}, //1:40pm
{title:"Suspect Apprehended", timestmp: new Date(baseDate+'13:41:00'), description:
	"Breaking: suspect being apprehended on steps of performing arts building on College Ave."}, //1:41pm
{title:"One suspect still at large", timestmp: new Date(baseDate+'13:46:00'), description:
	"Person who surrendered was wearing gray shirt and jeans. Unsure if he was suspect"+
	"RT @zcrizer Police entering performance arts building on College Ave. One person surrendered. Another apparently at large"},//1:46pm
{title:"Shots heard near Torgersen Hall", timestmp: new Date(baseDate+'13:53:00'), description:
	"Students are reporting shots near Torgersen Hall"+
    "Breaking: person who surrendered at Performance Arts Building is not under arrest"+
    "Also hearing reports of someone running under Latham Hall on other side of campus"+
    "Person outside performing arts building surrendered with hands up. http://yfrog.com/mnvumoj"}, //1:53pm
{title:"2 people reported dead", timestmp: new Date(baseDate+'13:54:00'), description:
	"Virginia Tech confirms police officer, 1 other person killed in shootings on campus"}, //1:54pm
{title:"Official Update", timestmp: new Date(baseDate+'13:59:00'), description:
	"Shortly after noon today, a Virginia Tech police officer stopped a vehicle on campus during a routine traffic stop in the Coliseum parking lot near McComas Hall"+
    "During the traffic stop. the officer was shot and killed. There were witnesses to this shooting."+
    "Witnesses reported to police the shooter fled on foot heading toward the Cage, a parking lot near Duck Pond Drive."+
    "At that parking lot, a second person was found. That person is also deceased."+
    "Several law enforcement agencies have responded to assist. Virginia State Police has been requested to take lead in the investigation"+
    "The status of the shooter is unknown. The campus community should continue to shelter in place and visitors should not come to campus."}, //1:59pm
{title:"Shots reported", timestmp: new Date(baseDate+'14:00:00'), description:
	"There are multiple reports of shots and police activity, but most pressing appears to be in Squires"}, //2pm
{title:"SWAT Responding", timestmp: new Date(baseDate+'14:17:00'), description:
	"SWAT outside Squires T RT @VTmorrison: SWAT van outside squires http://bit.ly/tB8Bie"}, //2:17pm
{title:"Federal Agents on Campus", timestmp: new Date(baseDate+'14:24:00'), description:
	"6 ATF agents are on campus, 20 others on standby. FBI rushing agents down also"}, //2:24pm
{title:"Reported Gunshots", timestmp: new Date(baseDate+'14:30:00'), description:
	"Reports of recent sounds ID'd as gunshots and suspicious activity on campus have been investigated and are unfounded. Stay where you are."}, //2:30pm
{title:"Photos from Collegiate Times", timestmp: new Date(baseDate+'14:33:00'), descritpion:
	"http://www.flickr.com/photos/geeknerd99/sets/72157628335925205/"}, //2:33pm
{title:"More photos", timestmp: new Date(baseDate+'14:43:00'), description:
	"http://imgur.com/a/1dH9z"}, //2:43pm
{title:"SWAT done searching Squires", timestmp: new Date(baseDate+'14:45:00'), description:
	"SWAT team has left after searching Squires Student Center. No suspicious persons inside."}, //2:45pm
];

/**
 * Get an element from the event list
 */
this.getEvent= function(index){
	if(index >= data.length){
		return null;
	}
	var toRet = data[index];
	for(e in defaults){
		toRet[e] = defaults[e];
	}
	return toRet;
};

/**
 * Return the number of events
 */
this.numEvents = function(){
	return data.length;
};
