const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

router.post('/', async (req, res) => {
  try {
    const { mood, journal } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    // Fallback if no API key is set
    if (!apiKey || apiKey === 'your_api_key_here') {
      let fallbackText = "I'm here for you. Take a deep breath.";
      if(mood === '😔' || mood === '😣') fallbackText = "I'm here for you. Try a breathing exercise or write one small gratitude.";
      else if(mood === '😡') fallbackText = "Take a moment and take 3 slow breaths.";
      else if(mood === '😊' || mood === '🤩' || mood === '🙂') fallbackText = "Nice! Keep going — your positive streak helps.";
      return res.json({ response: fallbackText });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    let context = `The user is feeling: ${mood}. `;
    if (journal && journal.length > 0) {
      context += `Recent journal entries: "${journal.slice(-3).map(j => j.text).join(' | ')}". `;
    }
    context += `Give a very short (max 2 sentences), supportive, and empathetic response as a wellness companion. Be extremely concise.`;

    const result = await model.generateContent(context);
    const text = result.response.text();

    res.json({ response: text });
  } catch (err) {
    console.error(err.message);
    res.json({ response: "I'm here for you. Take a deep breath." }); // Safe fallback on error
  }
});

module.exports = router;
