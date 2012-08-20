/**
 * This handles new GCM registrations, and saves them into a collection
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var config = require('../config.js');
var gcm = require('node-gcm');
var API_KEY = 'AIzaSyAHKuZ6cEvASflzMoc_Mmb_rPoiZLTzLXE';


//Connect to the database
/*
if(!config.noDB){
	mongoose.connect('mongodb://'+config.db_host+':'+config.db_port+'/'+config.db_collection);
	console.log('Connected to '+config.db_host+':'+config.db_port+'/'+config.db_collection);
};
*/

//Maybe store the email too?
RegisteredDataSchema = new Schema({
	registrationId	:	String
});

registeredData = mongoose.model('GCM', RegisteredDataSchema);

var registeredIds = [];

function saveRegistration(body, res){
	var registration = new RegesteredDate({registrationId: body.id});
	if(!config.noDB){
		registration.save(function(err){
			if(err){
				res.status(500);
				res.json({error:'Error'});
				res.end();
				return;
			}
			res.json({status:'OK'});
			res.end();
		});
	} else {
		registeredIds.push(registration);
		res.send({status:"OK"});
		res.end();
	}
}

function unregister(id, res){
	if(config.noDB){
		registeredData.find({registrationId:id}, function(err, docs){
		    if(err){
		        res.status(500);
		        res.json({status:'Error'});
		        res.end();
		        return;
		    }
		    for(cur in docs){
    		    cur.remove();
    		}
    		res.json({status:'OK'});
    		res.end();
		});
	} else {
		for(var i =0; i < registeredIds.length; i++){
		    if(registeredIds[i].registationId == id){
		        registeredIds.splice(i,1);
		        res.json({status:'OK'});
		        res.end();
		        return;
		    }
		}
		res.status(404);
    	res.json({error:"Not found"});
    	res.end();
	}
}

function listAll(res){
    if(config.noDB){
        res.json(registeredIds);
        res.end();
    } else {
        registeredData.find({}, function(err,docs){
            if(err){
                res.status(500);
                res.json({error:'Error'});
                res.end();
                return;
            }
            res.json(docs);
            res.end();
        });
    }
}


this.load = function(app){
	
	/**
	 * Listen for incoming registration
	 */
	app.post('/gcm/register', function(req, res){
		saveRegistration(req.body, res);
	});
	
	/**
	 * Listen for requests to unregister
	 */
	app.post('/gcm/unregister', function(req, res){
		unregister(req.body.id, res);
	});
	
	app.get('/gcm/', function(req, res){
	    listAll(res);
	});
};

this.sendEvent = function(title, id, gid){
    var message = new gcm.Message();
    var sender = new gcm.Sender(API_KEY);
    var ids = [];
    
    //Add the title and ID data
    message.addData('title', title);
    message.addData('id', id);
    //This allows the GCM servers to deliver only 1 message per key if a device is offline or something
    message.collapseKey = gid;
    //Not sure what unit this is, but 2 sounds like a good choice
    message.timeToLive = 2;
    
    //Need to get all the IDs now, up to 1000 at a time
    if(cofig.noDB){
        for(var i = 0; i < registeredIds.length && i < 1000; i++){
            ids.push(registeredIds[i].registrationId);
        }
        sender.send(message, ids, 5, function(result){
            console.log(result);
        });
    } else {
        registeredData.find({}).limit(1000).execFind(function(err, docs){
            if(err){
                //Well, crap.
                console.log(err);
                return;
            }
            for(var i =0; i < docs.length; i++){
                ids.push(docs[i].registrationId);
            }
            sender.send(message, ids, 5, function(result){
                console.log(result);
            });
        });
    }
}

