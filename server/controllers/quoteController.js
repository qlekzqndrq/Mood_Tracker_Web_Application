const Quote = require('../models/Quote');

const getQuoteByMood = async (req, res) => {
    try {
        const { moodScore } = req.params; 

        const quoteDoc = await Quote.findOne({ moodScore: moodScore });

        if (!quoteDoc) {
            return res.status(404).json({ message: "Nu am citate pentru această stare." });
        }

        const randomIndex = Math.floor(Math.random() * quoteDoc.quotes.length);
        const randomQuote = quoteDoc.quotes[randomIndex];

        res.status(200).json({ quote: randomQuote });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getQuoteByMood };