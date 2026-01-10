const mongoose = require('mongoose');
require('dotenv').config(); 

// --- 1. Import Modele & Date ---
const data = require('./data.json'); 
const User = require('./models/user'); 
// FIX: Numele fișierelor trebuie să fie cu literă mică, exact ca în folder
const DailyLog = require('./models/dailyLog'); 
const Quote = require('./models/quote');

// FIX: Adăugat fallback direct la localhost ca să nu depindem de .env
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/moodtracker'; 

// --- 2. Funcția Principală de Import ---
const importData = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('--- Conexiune DB reușită ---');

        // A. Ștergerea Datelor Vechi
        await DailyLog.deleteMany();
        await Quote.deleteMany();
        
        // FIX: Ștergem și userii vechi ca să fim siguri că cel nou are parola bună
        await User.deleteMany(); 

        // B. Crearea Utilizatorului de Test
        let testUser = await User.create({
            name: 'Tester User',
            email: 'test@moodtracker.com',
            password: '123456', // Parola
            avatarURL: 'https://ui-avatars.com/api/?name=Tester+User'
        });
        console.log('Utilizator creat: test@moodtracker.com parola: 123456');
        
        const testUserID = testUser._id;

        // C. Inserarea Logărilor Zilnice
        const dailyLogsToInsert = data.moodEntries.map(entry => ({
            userID: testUserID, 
            date: new Date(entry.createdAt), 
            moodScore: entry.mood,
            feelings: entry.feelings,
            journalEntry: entry.journalEntry, 
            sleepHours: entry.sleepHours
        }));

        await DailyLog.insertMany(dailyLogsToInsert);
        console.log(`- ${dailyLogsToInsert.length} logări zilnice inserate.`);
        
        // D. Inserarea Citatelor
        const quoteKeys = Object.keys(data.moodQuotes);
        const quotesToInsert = quoteKeys.map(key => ({
            moodScore: key, 
            quotes: data.moodQuotes[key]
        }));
        
        await Quote.insertMany(quotesToInsert);
        console.log(`- ${quotesToInsert.length} seturi de citate inserate.`);

        // --- Finalizare ---
        console.log('Popularea bazei de date a fost finalizată cu succes!');
        mongoose.connection.close(); 
        
    } catch (error) {
        console.error('EROARE CRITICĂ:', error);
        mongoose.connection.close(); 
        process.exit(1);
    }
};

importData();