const mongoose = require('mongoose');
require('dotenv').config(); 


const data = require('./data.json'); 
const User = require('./models/user'); 

const DailyLog = require('./models/dailyLog'); 
const Quote = require('./models/quote');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/moodtracker'; 

const importData = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('--- Conexiune DB reușită ---');

        await DailyLog.deleteMany();
        await Quote.deleteMany();
        
        await User.deleteMany(); 

        let testUser = await User.create({
            name: 'Tester User',
            email: 'test@moodtracker.com',
            password: '123456', 
            avatarURL: 'https://ui-avatars.com/api/?name=Tester+User'
        });
        console.log('Utilizator creat: test@moodtracker.com parola: 123456');
        
        const testUserID = testUser._id;

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
        
        const quoteKeys = Object.keys(data.moodQuotes);
        const quotesToInsert = quoteKeys.map(key => ({
            moodScore: key, 
            quotes: data.moodQuotes[key]
        }));
        
        await Quote.insertMany(quotesToInsert);
        console.log(`- ${quotesToInsert.length} seturi de citate inserate.`);

        console.log('Popularea bazei de date a fost finalizată cu succes!');
        mongoose.connection.close(); 
        
    } catch (error) {
        console.error('EROARE CRITICĂ:', error);
        mongoose.connection.close(); 
        process.exit(1);
    }
};

importData();