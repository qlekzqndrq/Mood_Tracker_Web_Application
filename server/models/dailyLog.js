const mongoose = require('mongoose'); 

const dailyLogSchema = new mongoose.Schema({
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        required: true,
        unique: true
    },
    moodScore: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    feelings: {type: [String]}, 
    journalEntry: {type: String, default: ''}, 
    sleepHours: {
        type: Number, 
        required: true, 
        min: 0, 
        max: 24
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('DailyLog', dailyLogSchema);