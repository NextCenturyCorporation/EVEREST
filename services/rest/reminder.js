var ReminderService = require('../database/reminder')
var responseHandler = require('../general_response');

module.exports = function(app, models, io, logger) {
    var me = this;

    var reminderService = new ReminderService(models, io, logger);

    app.get('/reminder/?', function(req, res) {
        if(logger.DO_LOG) {
            logger.info('Request for a list of all reminders');
        }

        reminderService.list(req.query, function(err, docs, config) {
            if(err) {
                logger.error("rest.reminder.get('reminder/?)': Error listing reminders: " + err);
                responseHandler.send500(res, 'Error listing reminders');
            } else {
                res.jsonp({ docs: docs });
                res.end();
            }
        });
    });

    app.post('/reminder/?', function(req, res) {
        if(logger.DO_LOG) {
            logger.info("rest.reminder.post('/reminder/?'): Received new reminder: " + req.body);
        }

        reminderService.create(req.body, function(err, val, newReminder) {
            if(err) {
                logger.error("rest.reminder.post('/reminder/?'): Could not save new reminder: " + err);
                responseHandler.send500(res, 'Error saving reminder');
            } else if(val && !val.valid) {
                logger.error("rest.reminder.post('/reminder/?'): Invalid Reminder" + JSON.stringify(val.errors));
                responseHandler.send500(res, 'Invalid Reminder');
            } else {
                logger.info("rest.reminder.post('/reminder/?'): Reminder Saved: " + JSON.stringify(newReminder));
                res.jsonp({ _id: newReminder._id });
                res.end();
            }
        });
    });
};