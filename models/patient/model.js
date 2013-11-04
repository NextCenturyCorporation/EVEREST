var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var patientReminder = new Schema({
    reminder_id: Schema.Types.ObjectId,
    completed: Boolean,
    dateCompleted: Date,
    dueDate: Date,
    title: String,
    performedBy: String,
});

var patientModel = {
    createdDate: Date,
    updatedDate: Date,
    name: String,
    reminders: [patientReminder]
};

var PatientSchema = new Schema(patientModel);
var patient = mongoose.model('Patient', PatientSchema);

exports.patient = patient;