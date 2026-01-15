const router = require('express').Router();
const DailyLog = require('../models/dailyLog');
const jwt = require('jsonwebtoken'); 

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "Lipsă token!" });

    const token = authHeader.split(' ')[1];

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified; 
        next(); 
    } catch (err) {
        res.status(401).json({ message: "Token invalid sau expirat" });
    }
};

router.post('/', verifyToken, async (req, res) => {
    try {
        const userId = req.user._id || req.user.id; 

        console.log("Salvare log pentru User ID:", userId);

        const newLog = new DailyLog({
            moodScore: req.body.moodScore,
            sleepHours: req.body.sleepHours,
            journalEntry: req.body.journalEntry || "", 
            feelings: req.body.feelings || [],
            date: new Date(),
            userID: userId
        });

        const savedLog = await newLog.save();
        res.status(201).json(savedLog);

    } catch (err) {
        console.error("EROARE SERVER:", err.message); 
        res.status(500).json({ message: "Eroare server: " + err.message });
    }
});

router.get('/recent', verifyToken, async (req, res) => {
    try {
        const userId = req.user._id || req.user.id; 
        const logs = await DailyLog.find({ userID: userId }).sort({ date: -1 }).limit(7);
        res.json(logs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/stats', verifyToken, async (req, res) => {
    try {
        const userId = req.user._id || req.user.id; 

        const logs = await DailyLog.find({ userID: userId }).sort({ date: -1 }).limit(10);

        if (logs.length < 5) {
            return res.json({ hasEnoughData: false, currentCount: logs.length });
        }

        const recent5 = logs.slice(0, 5);
        const avgMoodRecent = recent5.reduce((sum, l) => sum + l.moodScore, 0) / 5;
        const avgSleepRecent = recent5.reduce((sum, l) => sum + l.sleepHours, 0) / 5;

        const previous5 = logs.slice(5, 10);
        let comparison = null;
        let previousData = null;

        if (previous5.length > 0) {
            const avgMoodPrevious = previous5.reduce((sum, l) => sum + l.moodScore, 0) / previous5.length;
            const avgSleepPrevious = previous5.reduce((sum, l) => sum + l.sleepHours, 0) / previous5.length;

            previousData = { mood: avgMoodPrevious, sleep: avgSleepPrevious };

            let moodText = "";
            const moodDiff = avgMoodRecent - avgMoodPrevious;
            if (Math.abs(moodDiff) < 0.3) moodText = "Same as the previous check-ins";
            else if (moodDiff > 0) moodText = "Feeling better than the usual 📈";
            else moodText = "Feeling lower than the usual 📉";

            let sleepText = "";
            const sleepDiff = avgSleepRecent - avgSleepPrevious;
            if (Math.abs(sleepDiff) < 0.5) sleepText = "Same as the previous check-ins";
            else if (sleepDiff > 0) sleepText = `+${sleepDiff.toFixed(1)}h vs previous`;
            else sleepText = `${sleepDiff.toFixed(1)}h vs previous`;

            comparison = { mood: { text: moodText }, sleep: { text: sleepText } };
        }

        res.json({
            hasEnoughData: true,
            recent: { mood: avgMoodRecent.toFixed(1), sleep: avgSleepRecent.toFixed(1) },
            previous: previousData,
            comparison: comparison
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;