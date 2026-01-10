const router = require('express').Router();
const User = require('../models/user'); // Importăm modelul tău existent

// 1. REGISTER (Creare cont)
router.post('/signup', async (req, res) => {
    try {
        // Căutăm dacă există deja userul
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }

        // Creăm userul nou
        const newUser = new User({
            email: req.body.email,
            password: req.body.password, // Notă: Într-o aplicație reală se criptează parola
            name: "New User", // Nume default
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

        // Verificăm parola (simplu)
        if (user.password !== req.body.password) {
            return res.status(400).json({ message: "Wrong password" });
        }

        // Dacă e totul ok, trimitem un "bilet" (token) și datele lui
        // Token-ul e ID-ul lui din baza de date
        res.status(200).json({ 
            message: "Login successful",
            token: user._id, 
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