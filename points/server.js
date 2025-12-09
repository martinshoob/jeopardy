const express = require("express")
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const http = require("http"); // Import HTTP
const { Server } = require("socket.io"); // Import Socket.io

const app = express();
const server = http.createServer(app); // Wrap express
const PORT = 3000;

// Setup Socket.io with CORS allowed for your Jeopardy frontend
const io = new Server(server, {
  cors: {
    origin: "*", // Allow connections from any port (e.g., your Jeopardy board)
    methods: ["GET", "POST"]
  }
});

const playersFilePath = path.join(__dirname, "players.json");

app.use(express.static("public"));
app.use(express.json());
app.use(cors());

// --- SOCKET.IO LOGIC ---
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // 1. Admin sends a navigation command (e.g., "Open Q 100")
  socket.on('admin_command', (data) => {
    // Broadcast this to the Jeopardy Board
    io.emit('board_navigate', data);
  });

  // 2. Jeopardy Board sends the current active question details
  socket.on('board_state_update', (data) => {
    // Send this specific data to the Admin interface
    io.emit('admin_receive_state', data);
  });
});
// -----------------------

app.get("/players", (req, res) => {
  fs.readFile(playersFilePath, (err, data) => {
    if (err) {
      res.status(500).json({ error: "Failed to read players.json" });
    } else {
      res.json(JSON.parse(data));
    }
  });
});

app.post("/update", (req, res) => {
  const { index, points } = req.body;

  fs.readFile(playersFilePath, (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Failed to read players.json" });
    }

    let players;
    try {
      players = JSON.parse(data);
    } catch (parseError) {
      return res.status(500).json({ error: "Failed to parse players.json" });
    }

    if (index < 0 || index >= players.players.length) {
      return res.status(400).json({ error: "Invalid player index" });
    }

    players.players[index].points += points;

    fs.writeFile(playersFilePath, JSON.stringify(players, null, 2), (err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to update players.json" });
      }
      res.json({ message: "Player points updated successfully" });
      // Optional: Tell admin UI to refresh points immediately via socket
      io.emit('points_updated');
    });
  });
});

server.listen(PORT, () => {
  console.log(`Points server running on http://localhost:${PORT}`);
});
