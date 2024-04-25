const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const certificateSchema = new Schema({
    certificateID: {
        type: String,
        required: true
    },
    courseName: {
        type: String,
        required: true
    },
    teacher: {
        type: String,
        required: true
    },
    certificateLink: {
        type: String,
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});

module.exports = mongoose.model('Certificate', certificateSchema);
