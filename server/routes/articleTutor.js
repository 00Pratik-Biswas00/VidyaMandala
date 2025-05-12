const express = require('express');
const axios = require('axios');
const router = express.Router();

// Flask base URL
const FLASK_BASE_URL = "http://localhost:8000";

// START SESSION
router.post('/start-article-tutor', async (req, res) => {
  try {
    const { url } = req.body;
    const response = await axios.post(`${FLASK_BASE_URL}/start`, { url }, { withCredentials: true });
    res.json(response.data);
  } catch (error) {
    console.error("Start session error:", error.message);
    res.status(500).json({ error: "Failed to start article tutor" });
  }
});

// GET NEXT QUESTION
router.get('/next-question', async (req, res) => {
  try {
    const response = await axios.get(`${FLASK_BASE_URL}/next-question`, { withCredentials: true });
    res.json(response.data);
  } catch (error) {
    console.error("Next question error:", error.message);
    res.status(500).json({ error: "Failed to get next question" });
  }
});

// SUBMIT ANSWER
router.post('/submit-answer', async (req, res) => {
  try {
    const { answer } = req.body;
    const response = await axios.post(`${FLASK_BASE_URL}/submit-answer`, { answer }, { withCredentials: true });
    res.json(response.data);
  } catch (error) {
    console.error("Submit answer error:", error.message);
    res.status(500).json({ error: "Failed to evaluate answer" });
  }
});

module.exports = router;
