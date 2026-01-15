const router = require('express').Router();

const quotesDB = {
    // 1 = Very Sad (Foarte Trist)
    "1": [
        "It is okay to not be okay. Breathe.",
        "This is just a bad day, not a bad life.",
        "Cry if you need to. It lets the pain out.",
        "You are stronger than this moment.",
        "Sending you a virtual hug. Take it easy today."
    ],
    // 2 = Sad (Trist)
    "2": [
        "Tomorrow is a fresh start.",
        "Be gentle with yourself today.",
        "Clouds pass, and the sun always returns.",
        "One step at a time is enough.",
        "You've survived 100% of your bad days so far."
    ],
    // 3 = Neutral (Neutru)
    "3": [
        "Peace is a superpower.",
        "Enjoy the calm of this moment.",
        "A quiet mind is able to hear intuition.",
        "Balance is key to a happy life.",
        "Simplicity is the ultimate sophistication."
    ],
    // 4 = Happy (Fericit)
    "4": [
        "Your smile is contagious!",
        "Focus on the good and the good gets better.",
        "Happiness looks beautiful on you.",
        "Today is a good day to have a good day.",
        "Keep this positive energy flowing!"
    ],
    // 5 = Very Happy (Foarte Fericit)
    "5": [
        "You are glowing today!",
        "Spread your light everywhere you go!",
        "Unstoppable. That's what you are.",
        "Celebrate this amazing feeling!",
        "The world needs more of your energy!"
    ]
};

router.get('/:moodScore', (req, res) => {
    try {
        const score = req.params.moodScore.toString();

        const list = quotesDB[score] || quotesDB["3"];

        const randomQuote = list[Math.floor(Math.random() * list.length)];

        res.json({ 
            quote: randomQuote,
            mood: score 
        });

    } catch (err) {
        console.error("Eroare la citate:", err);
        res.status(500).json({ quote: "Keep going!" }); 
    }
});

module.exports = router;