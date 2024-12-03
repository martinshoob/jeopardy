const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = 3000;

const playersFilePath = path.join(__dirname, "players.json");

app.use(express.static("public"));
app.use(express.json());
app.use(cors());

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
    });
  });
});



app.listen(PORT, () => {
  console.log(`Points server running on http://localhost:${PORT}`);
});
