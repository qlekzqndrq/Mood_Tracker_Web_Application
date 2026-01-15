const router = require('express').Router();
const User = require('../models/user'); 
const jwt = require('jsonwebtoken'); 

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

router.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.password !== req.body.password) {
            return res.status(400).json({ message: "Wrong password" });
        }
    
        const token = jwt.sign(
            { _id: user._id },      
            process.env.JWT_SECRET,  
            { expiresIn: '1d' }      
        );

        res.status(200).json({ 
            message: "Login successful",
            token: token, 
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