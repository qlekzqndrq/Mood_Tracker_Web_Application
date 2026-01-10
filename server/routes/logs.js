const router = require('express').Router();
const DailyLog = require('../models/dailyLog');
const User = require('../models/user'); 

// 1. SALVARE (Când apeși Submit)
router.post('/', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ message: "Trebuie să fii logat!" });
        
        const userId = authHeader.split(' ')[1];

        console.log("📥 Salvare log pentru User ID:", userId);

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
        console.error("❌ EROARE SERVER:", err.message); 
        res.status(500).json({ message: "Eroare server: " + err.message });
    }
});

// 2. CITIRE ISTORIC (Doar ale mele)
router.get('/recent', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json([]);
        const userId = authHeader.split(' ')[1];

        const logs = await DailyLog.find({ userID: userId }).sort({ date: -1 }).limit(7);
        res.json(logs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 3. STATISTICI (Cu texte inteligente)
router.get('/stats', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.json({ hasEnoughData: false });
        }

        const userId = authHeader.split(' ')[1];

        // Luăm ultimele 10 intrări pentru comparație
        const logs = await DailyLog.find({ userID: userId }).sort({ date: -1 }).limit(10);

        if (logs.length < 5) {
            return res.json({
                hasEnoughData: false,
                currentCount: logs.length
            });
        }

        // Ultimele 5 check-ins (cele mai recente)
        const recent5 = logs.slice(0, 5);
        const avgMoodRecent = recent5.reduce((sum, l) => sum + l.moodScore, 0) / 5;
        const avgSleepRecent = recent5.reduce((sum, l) => sum + l.sleepHours, 0) / 5;

        // Următoarele 5 check-ins (pentru comparație)
        const previous5 = logs.slice(5, 10);

        let comparison = null;

        if (previous5.length === 5) {
            const avgMoodPrevious = previous5.reduce((sum, l) => sum + l.moodScore, 0) / 5;
            const avgSleepPrevious = previous5.reduce((sum, l) => sum + l.sleepHours, 0) / 5;

            // Texte inteligente pentru Mood
            let moodText = "";
            const moodDiff = avgMoodRecent - avgMoodPrevious;

            if (Math.abs(moodDiff) < 0.3) {
                moodText = "Same as the previous check-ins";
            } else if (moodDiff > 0) {
                moodText = "Feeling better than the usual 📈";
            } else {
                moodText = "Feeling lower than the usual 📉";
            }

            // Texte inteligente pentru Sleep
            let sleepText = "";
            const sleepDiff = avgSleepRecent - avgSleepPrevious;

            if (Math.abs(sleepDiff) < 0.5) {
                sleepText = "Same as the previous check-ins";
            } else if (sleepDiff > 0) {
                sleepText = `+${sleepDiff.toFixed(1)}h vs the previous check-ins 📈`;
            } else {
                sleepText = `${sleepDiff.toFixed(1)}h vs the previous check-ins 📉`;
            }

            comparison = {
                mood: { text: moodText },
                sleep: { text: sleepText }
            };
        }

        res.json({
            hasEnoughData: true,
            recent: {
                mood: avgMoodRecent.toFixed(1),
                sleep: avgSleepRecent.toFixed(1)
            },
            comparison: comparison
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;