const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 4000;

// Enable CORS for all origins (you can restrict it if needed)
app.use(cors()); // This allows the frontend to make requests to the backend

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Add more routes as necessary (like your /players route)

app.listen(port, () => {
  console.log(`Jeopardy server is running at http://localhost:${port}`);
});
