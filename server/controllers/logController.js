// aici avem logica pentru stari/moods (logs)
const DailyLog = require('../models/dailyLog');
const User = require('../models/user');

// 1. SALVARE SAU ACTUALIZARE (Create / Update Today)
const createLog = async (req, res) => {
    try {
        const { moodScore, feelings, journalEntry, sleepHours } = req.body;
        
        // 1. Găsim userul
        const user = await User.findOne({ email: 'test@moodtracker.com' });
        if (!user) return res.status(404).json({ error: "Utilizator test negăsit" });

        // 2. Definim intervalul "AZI" (de la 00:00 la 23:59)
        const startODay = new Date();
        startODay.setHours(0, 0, 0, 0);
        
        const endODay = new Date();
        endODay.setHours(23, 59, 59, 999);

        // 3. Căutăm dacă există deja un log PE ZIUA DE AZI
        let log = await DailyLog.findOne({
            userID: user._id,
            date: { $gte: startODay, $lte: endODay }
        });

        if (log) {
            // SCENARIUL A: UPDATE (Există deja)
            log.moodScore = moodScore;
            log.feelings = feelings;
            log.journalEntry = journalEntry;
            log.sleepHours = sleepHours;
            // Nu schimbăm data, ca să nu strice ordinea, sau o actualizăm la "acum"
            // log.date = new Date(); 
            
            await log.save();
            return res.status(200).json(log); // 200 OK (Updated)

        } else {
            // SCENARIUL B: CREATE (Nu există)
            const newLog = await DailyLog.create({
                userID: user._id,
                date: new Date(),
                moodScore,
                feelings,
                journalEntry,
                sleepHours
            });
            return res.status(201).json(newLog); // 201 Created
        }

    } catch (error) {
        console.error(error);
        res.status(400).json({ error: 'Eroare la salvare.' });
    }
};

// 2. OBTINERE DATE GRAFIC (Read Recent)
const getRecentLogs = async (req, res) => {
    try {
        // Căutăm ultimele 11 înregistrări, sortate descrescător după dată
        const logs = await DailyLog.find()
            .sort({ date: -1 }) //-1 returneaza ultimele inreg, cele mai recente
            .limit(11);
        
        res.status(200).json(logs);
    } catch (error) {
        res.status(500).json({ error: 'Eroare server la preluarea datelor.' });
    }
};

//obtinere date 
const getStats = async (req, res) => {  
    try {
        // 1. Luăm ultimele 10 înregistrări
        const logs = await DailyLog.find().sort({ date: -1 }).limit(10);

        // 2. Dacă nu avem măcar 5 logări, afișăm starea "Empty"
        if (logs.length < 5) {
            return res.status(200).json({
                hasEnoughData: false,
                currentCount: logs.length
            });
        }

        // 3. Împărțim seturile: recente (0-5) și anterioare (5-10)
        const recentLogs = logs.slice(0, 5);    
        const previousLogs = logs.slice(5, 10); 

        // 4. FUNCȚIE AJUTĂTOARE
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
        let previousData = null; // <--- MODIFICARE 1: Variabilă nouă pentru a stoca datele
        
        // 5. Logica de comparație
        if (previousLogs.length > 0) {
            const prevMoodAvg = calculateAvg(previousLogs, 'moodScore');
            const prevSleepAvg = calculateAvg(previousLogs, 'sleepHours');

            // <--- MODIFICARE 2: Salvăm valorile numerice ca să le trimitem la Frontend
            previousData = {
                mood: prevMoodAvg,
                sleep: prevSleepAvg
            };

            // Calcul Mood (Text pentru Fallback)
            let moodText = "Same as the previous check-ins";
            if (recentMoodAvg > prevMoodAvg) moodText = "Feeling better than the usual 📈"; 
            if (recentMoodAvg < prevMoodAvg) moodText = "Feeling lower than the usual 📉";

            // Calcul Sleep (Text pentru Fallback)
            let sleepText = "Same as the previous check-ins";
            const sleepDiff = Number((recentSleepAvg - prevSleepAvg).toFixed(1));
            
            if (sleepDiff > 0) sleepText = `+${sleepDiff}h vs the previous check-ins`;
            if (sleepDiff < 0) sleepText = `${sleepDiff}h vs the previous check-ins`;

            comparison = {
                mood: { text: moodText },
                sleep: { text: sleepText }
            };
        }

        // 6. Trimitem obiectul COMPLET
        res.json({
            hasEnoughData: true,
            recent: {
                mood: recentMoodAvg,
                sleep: recentSleepAvg
            },
            previous: previousData, // <--- MODIFICARE 3: Trimitem datele anterioare!
            comparison: comparison 
        });

    } catch (error) { 
        console.error("Stats Error:", error);
        res.status(500).json({ error: "Eroare server la statistici." });
    }
};

// Exportăm funcțiile ca să le vadă Rutele
module.exports = {
    createLog,
    getRecentLogs,
    getStats
};