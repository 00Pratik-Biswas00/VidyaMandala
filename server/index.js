const express = require('express');
const cors = require('cors');
const articleTutorRoutes = require('./routes/articleTutor');

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',  // your React client
  credentials: true
}));

app.use(express.json());

app.use('/api/article-tutor', articleTutorRoutes);

app.listen(5000, () => {
  console.log("Express server running on http://localhost:5000");
});
