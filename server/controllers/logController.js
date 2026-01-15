const DailyLog = require('../models/dailyLog');
const User = require('../models/user');

const createLog = async (req, res) => {
    try {
        const { moodScore, feelings, journalEntry, sleepHours } = req.body;
        
        const user = await User.findOne({ email: 'test@moodtracker.com' });
        if (!user) return res.status(404).json({ error: "Utilizator test negăsit" });

        const startODay = new Date();
        startODay.setHours(0, 0, 0, 0);
        
        const endODay = new Date();
        endODay.setHours(23, 59, 59, 999);

        let log = await DailyLog.findOne({
            userID: user._id,
            date: { $gte: startODay, $lte: endODay }
        });

        if (log) {
            log.moodScore = moodScore;
            log.feelings = feelings;
            log.journalEntry = journalEntry;
            log.sleepHours = sleepHours;
            
            await log.save();
            return res.status(200).json(log); 

        } else {
            const newLog = await DailyLog.create({
                userID: user._id,
                date: new Date(),
                moodScore,
                feelings,
                journalEntry,
                sleepHours
            });
            return res.status(201).json(newLog); 
        }

    } catch (error) {
        console.error(error);
        res.status(400).json({ error: 'Eroare la salvare.' });
    }
};

const getRecentLogs = async (req, res) => {
    try {
        const logs = await DailyLog.find()
            .sort({ date: -1 }) 
            .limit(11);
        
        res.status(200).json(logs);
    } catch (error) {
        res.status(500).json({ error: 'Eroare server la preluarea datelor.' });
    }
};

const getStats = async (req, res) => {  
    try {
        const logs = await DailyLog.find().sort({ date: -1 }).limit(10);

        if (logs.length < 5) {
            return res.status(200).json({
                hasEnoughData: false,
                currentCount: logs.length
            });
        }

        const recentLogs = logs.slice(0, 5);    
        const previousLogs = logs.slice(5, 10); 

        const calculateAvg = (list, field) => {
            if (!list.length) return 0;
            const sum = list.reduce((acc, curr) => {
                const val = Number(curr[field]);
                return acc + (isNaN(val) ? 0 : val);
            }, 0);
            return Number((sum / list.length).toFixed(1)); 
        };

        const recentMoodAvg = calculateAvg(recentLogs, 'moodScore');
        const recentSleepAvg = calculateAvg(recentLogs, 'sleepHours');

        let comparison = null; 
        let previousData = null; 
        
        if (previousLogs.length > 0) {
            const prevMoodAvg = calculateAvg(previousLogs, 'moodScore');
            const prevSleepAvg = calculateAvg(previousLogs, 'sleepHours');

            previousData = {
                mood: prevMoodAvg,
                sleep: prevSleepAvg
            };

            let moodText = "Same as the previous check-ins";
            if (recentMoodAvg > prevMoodAvg) moodText = "Feeling better than the usual 📈"; 
            if (recentMoodAvg < prevMoodAvg) moodText = "Feeling lower than the usual 📉";

            let sleepText = "Same as the previous check-ins";
            const sleepDiff = Number((recentSleepAvg - prevSleepAvg).toFixed(1));
            
            if (sleepDiff > 0) sleepText = `+${sleepDiff}h vs the previous check-ins`;
            if (sleepDiff < 0) sleepText = `${sleepDiff}h vs the previous check-ins`;

            comparison = {
                mood: { text: moodText },
                sleep: { text: sleepText }
            };
        }

        res.json({
            hasEnoughData: true,
            recent: {
                mood: recentMoodAvg,
                sleep: recentSleepAvg
            },
            previous: previousData, 
            comparison: comparison 
        });

    } catch (error) { 
        console.error("Stats Error:", error);
        res.status(500).json({ error: "Eroare server la statistici." });
    }
};

module.exports = {
    createLog,
    getRecentLogs,
    getStats
};