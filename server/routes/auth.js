const router = require('express').Router();
const User = require('../models/user'); 
const jwt = require('jsonwebtoken'); // <--- 1. IMPORTĂM JWT

// 1. REGISTER (Creare cont)
router.post('/signup', async (req, res) => {
    try {
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }

        const newUser = new User({
            email: req.body.email,
            password: req.body.password, 
            name: "New User", 
            avatarURL: "" 
        });

        const savedUser = await newUser.save();
        res.status(201).json({ message: "User created successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 2. LOGIN (Autentificare)
router.post('/login', async (req, res) => {
    try {
        // Căutăm userul după email
        const user = await User.findOne({ email: req.body.email });
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Verificăm parola
        if (user.password !== req.body.password) {
            return res.status(400).json({ message: "Wrong password" });
        }

        // --- SCHIMBAREA MAJORĂ ESTE AICI ---
        
        // Înainte trimiteai: token: user._id (Asta era greșit!)
        // Acum creăm un TOKEN REAL semnat cu cheia secretă a serverului:
        
        const token = jwt.sign(
            { _id: user._id },       // Payload (Ce date ascundem în token)
            process.env.JWT_SECRET,  // Cheia secretă (generată în server.js)
            { expiresIn: '1d' }      // Tokenul expiră într-o zi (opțional)
        );

        res.status(200).json({ 
            message: "Login successful",
            token: token, // <--- Trimitem token-ul criptat
            user: {
                name: user.name,
                email: user.email,
                avatarURL: user.avatarURL
            }
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;