var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var component = new Schema({
    who: String,
    what: String,
    when: String
});

var reminderModel = {
    createdDate: Date,
    updatedDate: Date,
    title: String,
    performedBy: String,
    exceptions: [String],
    moreInfo: String,
    components: [component]
};

var ReminderSchema = new Schema(reminderModel);
var reminder = mongoose.model('Reminder', ReminderSchema);

exports.reminder = reminder;