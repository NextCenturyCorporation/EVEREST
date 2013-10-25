module.exports = function(models, io, logger) {
    var me = this;

    me.list = function(req, callback) {
        models.reminder.find({}, function(error, response) {
            callback(error, response, {});
        });
    };

    me.create = function(data, callback) {
        var newReminder = new models.reminder(data);
        newReminder.save(function(err) {
            if(err) {
                logger.error('database.reminder.create: Error saving reminder: ' + err);
            }
            callback(err, { valid: true }, newReminder);
        });
    };

    //return a collection of reminders that match the list of given reminder ids
    me.matchIds = function(ids, callback) {
        models.reminder.where('_id').in(ids).exec(callback);
    };
};