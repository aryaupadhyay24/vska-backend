const mongoose = require('mongoose');

// Define the Course schema
const courseSchema = new mongoose.Schema({
    Name: {
        type: String,
        required: true
    },
    Time: {
        type: String,
        required: true
    },
    Date: {
        type: String,
        required: true
    },
    Company: {
        type: String,
        required: true
    },
    Role: {
        type: String,
        required: true
    }
});

// Create the Course model
const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
