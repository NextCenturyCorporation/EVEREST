var ReminderService = require('./reminder');

module.exports = function(models, io, logger) {
    var me = this;

    var reminderService = new ReminderService(models, io, logger);

    me.list = function(req, callback) {
        models.patient.find({}, function(error, response) {
            callback(error, response, {});
        });
    };

    me.get = function(id, callback) {
        models.patient.find({_id: id}, callback);
    };

    me.create = function(data, callback) {
        var newPatient = new models.patient(data);
        newPatient.save(function(err) {
            if(err) {
                logger.error('database.patient.create: Error saving the patient: ' + err);
            }
            callback(err, { valid: true }, newPatient);
        });
    };

    me.update = function(id, data, callback) {
        var valid = {}
        models.patient.find({_id: id}, function(err, docs) {
            if (err) {
                logger.error("database.patient.update: Error getting patient: " + err);
                callback(err, valid, data);
            } else if (docs) {
                docs = docs[0];
                for (var e in data) {
                    if (e !== '_id') {
                        docs[e] = data[e];
                    }
                }
                docs.updatedDate = new Date();
                valid.valid = true;
                docs.save(function(err){
                    if (err){
                        callback(err, valid, data);
                    } else {
                        callback(err, valid, docs);
                    }
                });
            } else {
                valid.valid = false;
                valid.errors = { expected: id, message: "Patient not found" };
                callback(err, valid, data);
            }
        });
    };
};