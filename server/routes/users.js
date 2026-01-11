const router = require('express').Router();
const User = require('../models/user');
const jwt = require('jsonwebtoken'); // <--- 1. IMPORTĂM TRADUCĂTORUL (JWT)

// GET PROFILE (Cere datele profilului)
router.get('/profile', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: "Nu ești autentificat (Lipsește header)" });
        }

        const token = authHeader.split(' ')[1];

        // --- MODIFICAREA E AICI ---
        // 1. Verificăm și decriptăm tokenul folosind cheia secretă
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 2. Acum avem ID-ul real în 'decoded._id'
        const user = await User.findById(decoded._id); 
        // --------------------------
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        res.json(user);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Eroare server sau token invalid" });
    }
});

// UPDATE PROFILE (Schimbă nume/poză)
router.put('/profile', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ message: "Unauthorized" });
        const token = authHeader.split(' ')[1];

        // --- MODIFICAREA E AICI ---
        // Decriptăm tokenul și aici pentru a ști pe cine actualizăm
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // --------------------------

        const user = await User.findByIdAndUpdate(decoded._id, {
            $set: {
                name: req.body.name,
                avatarURL: req.body.avatarURL
            }
        }, { new: true }); 

        res.json(user);
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;