require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');

// IMPORTĂM RUTELE 
const logsRouter = require('./routes/logs');
const quotesRouter = require('./routes/quotes'); 
const authRouter = require('./routes/auth');   
const usersRouter = require('./routes/users'); 

const app = express();
const PORT = process.env.PORT || 5000;

//CONFIGURĂRI 
app.use(cors()); 
app.use(express.json()); 
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '../public'))); 

// CONEXIUNE BAZA DE DATE 
mongoose.connect('mongodb://127.0.0.1:27017/moodtracker')
    .then(() => console.log('MongoDB conectat cu succes'))
    .catch(err => console.error('Eroare conexiune MongoDB:', err));

// ACTIVARE RUTE API
// Când cineva accesează /api/logs -> du-te la fișierul logs.js
app.use('/api/logs', logsRouter);
app.use('/api/quotes', quotesRouter);
app.use('/api/auth', authRouter);   // Login & Register
app.use('/api/users', usersRouter); // Profil Utilizator

// RUTA FINALĂ 
// Orice altă adresă care nu e API va deschide site-ul (index.html)
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// PORNIRE SERVER 
app.listen(PORT, () => {
    console.log(`Serverul a pornit pe portul: ${PORT}`);
});