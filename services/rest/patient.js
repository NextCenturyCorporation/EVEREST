var PatientService = require('../database/patient');
var responseHandler = require('../general_response');

module.exports = function(app, modules, io, logger) {
    var me = this;

    var patientService = new PatientService(modules, io, logger);

    app.get('/patient/?', function(req, res) {
        if(logger.DO_LOG) {
            logger.info("rest.patient: Request for a list of all patients");
        }

        patientService.list(req.query, function(err, docs, config) {
            if(err) {
                logger.error("rest.patient: Error listing patients: " + err);
                responseHandler.send500(res, 'Error listing patients');
            } else {
                res.jsonp({ docs: docs });
                res.end();
            }
        });
    });

    app.get('/patient/:id([0-9a-f]+)', function(req, res) {
        if(logger.DO_LOG) {
            logger.info("rest.patient: Request for a patient: " + req.params.id);
        }

        patientService.get(req.params.id, function(err, docs) {
            if(err) {
                logger.error('rest.patient: Error retrieving patient: ' + err);
                responseHandler.send500(res, 'Error retrieving patient');
            } else if (docs) {
                res.jsonp(docs);
                res.end();
            } else {
                responseHandler.send404(res);
            }
        });
    });

    /*
    app.get('/patient/:id([0-9a-f]+)/reminders', function(req, res) {
        if(logger.DO_LOG) {
            logger.info("rest.patient: Request for a list of patient reminders");
        }

        patientService.reminders(req.params.id, function(err, reminders) {
            if(err) {
                logger.error('rest.patient: Error listing patient reminders: ' + err);
                responseHandler.send500(res, 'Error listing patient reminders');
            } else if(reminders) {
                res.jsonp({ docs: reminders });
                res.end();
            } else {
                responseHandler.send404(res);
            }
        });
    });*/

    app.post('/patient/?', function(req, res) {
        if(logger.DO_LOG) {
            logger.info("rest.patient: Received new patient: " + req.body);
        }

        patientService.create(req.body, function(err, val, newPatient) {
            if(err) {
                logger.error("rest.patient: Could not save new patient: " + err);
                responseHandler.send500(res, 'Could not save patient');
            } else if (val && !val.valid) {
                logger.error("rest.patient: Invalid patient: " + JSON.stringify(val.errors));
                responseHandler.send500(res, 'Invalid Patient');
            } else {
                logger.info("rest.patient: Patient Saved: " + JSON.stringify(newPatient));
                res.jsonp({ _id: newPatient._id });
                res.end();
            }
        });
    });

    app.put('/patient/:id([0-9a-f]+)', function(req, res) {
        if(logger.DO_LOG) {
            logger.info("rest.patient: Received a patient update for: " + req.params.id);
        }

        patientService.update(req.params.id, req.body, function(err, val, updatedPatient) {
            if(err) {
                logger.error("rest.patient: Could not save patient " + err);
                responseHandler.send500(res, 'Could not save patient');
            } else if(val && !val.valid) {
                logger.error("rest.patient: Invalid patient: " + JSON.stringify(val.errors));
                responseHandler.send500(res, 'Could not save patient');
            } else {
                logger.info("rest.patient: Patient Saved: " + JSON.stringify(updatedPatient));
                res.jsonp({ _id: updatedPatient._id });
                res.end();
            }
        });
    });
};