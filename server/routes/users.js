const router = require('express').Router();
const User = require('../models/user');

// GET PROFILE (Cere datele profilului)
router.get('/profile', async (req, res) => {
    try {
        // 1. Luăm "Biletul" (Tokenul) din Header
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return res.status(401).json({ message: "Nu ești autentificat (Lipsește header)" });
        }

        // Tokenul vine sub forma "Bearer ID_USER", noi vrem doar ID_USER
        const token = authHeader.split(' ')[1];

        // 2. Căutăm userul specific după ID-ul din token
        const user = await User.findById(token); 
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        // Trimitem userul găsit
        res.json(user);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Eroare server" });
    }
});

// UPDATE PROFILE (Schimbă nume/poză)
router.put('/profile', async (req, res) => {
    try {
        // La fel, luăm ID-ul din token ca să știm PE CINE actualizăm
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ message: "Unauthorized" });
        const token = authHeader.split(' ')[1];

        const user = await User.findByIdAndUpdate(token, {
            $set: {
                name: req.body.name,
                avatarURL: req.body.avatarURL
            }
        }, { new: true }); // new: true returnează varianta actualizată

        res.json(user);
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;