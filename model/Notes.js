const mongoose = require('mongoose');
const { Schema } = mongoose;


const NotesSchema = new Schema({
    // i will define User table ka user id as foriegn key so that the two table link with object id of user
    user: {
        type:mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true,
    },
    tag: {
        type: String,
        default: "General"
    },
    date: {
        type: Date,
        default: Date.now
    },
});
module.exports = mongoose.model('notes', NotesSchema);