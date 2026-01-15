require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const crypto = require('crypto'); 

process.env.JWT_SECRET = crypto.randomBytes(64).toString('hex');
console.log("Server securizat cu o nouă cheie (Userii vechi sunt invalidați).");

const logsRouter = require('./routes/logs');
const quotesRouter = require('./routes/quotes'); 
const authRouter = require('./routes/auth');    
const usersRouter = require('./routes/users'); 

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors()); 
app.use(express.json()); 
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '../public'))); 

mongoose.connect('mongodb://127.0.0.1:27017/moodtracker')
    .then(() => console.log('MongoDB conectat cu succes'))
    .catch(err => console.error('Eroare conexiune MongoDB:', err));

app.use('/api/logs', logsRouter);
app.use('/api/quotes', quotesRouter);
app.use('/api/auth', authRouter);   
app.use('/api/users', usersRouter); 

app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
    console.log(`Serverul a pornit pe portul: ${PORT}`);
});