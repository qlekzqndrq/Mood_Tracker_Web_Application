const router = require('express').Router();
const DailyLog = require('../models/dailyLog');
const jwt = require('jsonwebtoken'); // <--- 1. IMPORTĂM JWT

// --- MIDDLEWARE DE PROTECȚIE (Funcție ajutătoare) ---
// Asta verifică dacă cheia se potrivește cu "încuietoarea" serverului
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "Lipsă token!" });

    const token = authHeader.split(' ')[1];

    try {
        // AICI SE ÎNTÂMPLĂ MAGIA: Verificăm semnătura cu cheia secretă a serverului
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified; // Salvăm datele userului (id) pentru a le folosi mai jos
        next(); // Dacă e ok, trecem mai departe
    } catch (err) {
        // Dacă cheia serverului s-a schimbat (la restart), asta va da eroare!
        res.status(401).json({ message: "Token invalid sau expirat" });
    }
};

// 1. SALVARE (Când apeși Submit)
// Adăugăm 'verifyToken' ca al doilea argument
router.post('/', verifyToken, async (req, res) => {
    try {
        // Acum luăm ID-ul din token-ul verificat, nu din headerul brut
        // (Presupunând că în token ai salvat ID-ul la login)
        // Dacă la login ai salvat: jwt.sign({ _id: user._id }, ...)
        const userId = req.user._id || req.user.id; 

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

// 2. CITIRE ISTORIC
router.get('/recent', verifyToken, async (req, res) => {
    try {
        const userId = req.user._id || req.user.id; // Luăm ID sigur din token
        const logs = await DailyLog.find({ userID: userId }).sort({ date: -1 }).limit(7);
        res.json(logs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 3. STATISTICI (Versiunea Reparata Anterior)
router.get('/stats', verifyToken, async (req, res) => {
    try {
        const userId = req.user._id || req.user.id; // Luăm ID sigur din token

        // Luăm ultimele 10 intrări
        const logs = await DailyLog.find({ userID: userId }).sort({ date: -1 }).limit(10);

        if (logs.length < 5) {
            return res.json({ hasEnoughData: false, currentCount: logs.length });
        }

        // Calculele tale (Recente vs Previous) - codul pe care l-am reparat deja
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

            // Texte fallback
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