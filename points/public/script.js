let currentPlayer = null;
let pointsToAdd = 0;
let isSubtracting = false;
let players = [];

async function fetchPlayerData() {
  const response = await fetch("/players");
  const data = await response.json();
  return data.players;
}

async function updatePlayerPoints(index, points) {
  await fetch("/update", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ index, points }),
  });
}

async function initializeBoard() {
  players = await fetchPlayerData();

  const board = document.getElementById("board");
  board.innerHTML = "";

  players.forEach((player, index) => {
    const playerContainer = document.createElement("div");
    playerContainer.classList.add("player");

    const playerName = document.createElement("div");
    playerName.classList.add("category");
    playerName.textContent = player.name;

    const playerPoints = document.createElement("div");
    playerPoints.classList.add("cell");
    playerPoints.id = `player${index + 1}`;
    playerPoints.textContent = player.points;
    playerPoints.onclick = () => selectPlayer(index);

    playerContainer.appendChild(playerName);
    playerContainer.appendChild(playerPoints);

    board.appendChild(playerContainer);
  });
}

async function selectPlayer(playerIndex) {
  const input = document.getElementById("custom-points");
  const customPoints = parseInt(input.value, 10);

  if (!isNaN(customPoints)) {
    pointsToAdd = customPoints;
    input.value = "";
  }

  if (pointsToAdd === 0) {
    return;
  }

  if (isSubtracting) {
    pointsToAdd = -Math.abs(pointsToAdd);
  }

  const newPoints = players[playerIndex].points + pointsToAdd;

  players[playerIndex].points = newPoints;
  document.getElementById(`player${playerIndex + 1}`).textContent = newPoints;

  await updatePlayerPoints(playerIndex, pointsToAdd);

  pointsToAdd = 0;
}

function setPoints(points) {
  pointsToAdd = points;
}

function toggleAddSubtract() {
  isSubtracting = !isSubtracting;

  const buttons = document.querySelectorAll("button");
  buttons.forEach(button => {
    if (button.id === "toggleSignButton") return;

    const currentText = button.textContent;
    if (currentText.includes("+")) {
      button.textContent = currentText.replace("+", "-");
    } else if (currentText.includes("-")) {
      button.textContent = currentText.replace("-", "+");
    }
  });
}

async function pollForUpdates() {
  setInterval(async () => {
    const updatedPlayers = await fetchPlayerData();

    updatedPlayers.forEach((updatedPlayer, index) => {
      if (updatedPlayer.points !== players[index].points) {
        const playerElement = document.getElementById(`player${index + 1}`);
        playerElement.textContent = updatedPlayer.points;
        players[index].points = updatedPlayer.points;
      }

      if (updatedPlayer.name !== players[index].name) {
        const playerNameElement = playerElement.previousSibling;
        playerNameElement.textContent = updatedPlayer.name;
        players[index].name = updatedPlayer.name;
      }
    });
  }, 2000);
}


document.addEventListener("DOMContentLoaded", async () => {
  await initializeBoard();
  pollForUpdates();
});

document.addEventListener("DOMContentLoaded", function () {
  document.addEventListener("click", async function (e) {
    if (e.target.id == "resetButton") {
      players = await fetchPlayerData();
      if (e.target.classList.contains("really")) {
        e.target.classList.remove("really");
        e.target.innerHTML = "RESET";
        for (let i = 0; i <= players.length; i++) {
          await updatePlayerPoints(i, -players[i].points);
        }
      }
      else {
        e.target.classList.add("really");
        e.target.innerHTML = "Really?";
      }
    }
  });
});

const socket = io();

const categories = ["Obecná znalost", "Kdo jak?", "Statistiky", "Vnitroherní znalosti", "Memeš"];
const values = [100, 200, 300, 400, 500];

// 1. Generate Remote Control Grid
function createRemoteGrid() {
  const grid = document.getElementById('nav-grid');

  // Create Headers
  categories.forEach(cat => {
    const el = document.createElement('div');
    el.innerText = cat;
    el.style.fontWeight = 'bold';
    el.style.textAlign = 'center';
    grid.appendChild(el);
  });

  // Create Buttons
  for (let i = 0; i < values.length; i++) {
    for (let j = 0; j < categories.length; j++) {
      const btn = document.createElement('button');
      btn.innerText = values[i];
      btn.onclick = () => {
        // Odesíláme i ID ve formátu "sloupec-řádek" (j-i), přesně jako v jeopardy.js
        sendRemoteCommand('open', {
          category: categories[j],
          value: values[i],
          id: `${j}-${i}`
        });
      };
      grid.appendChild(btn);
    }
  }
}

// 2. Send commands to Server -> Board
function sendRemoteCommand(type, payload = {}) {
  socket.emit('admin_command', { type, ...payload });
}

// 3. Listen for Question Data from Board
socket.on('admin_receive_state', (data) => {
  const box = document.getElementById('current-answer-box');
  const qText = document.getElementById('admin-q-text');
  const aText = document.getElementById('admin-a-text');
  const buttonsContainer = document.getElementById('quick-score-buttons');

  if (data.state === 'question_open') {
    box.style.display = 'block';
    qText.innerText = `${data.category} - ${data.value}`;
    aText.innerText = data.answer || "Loading answer...";

    // --- NOVÉ: Generování tlačítek pro hráče ---
    buttonsContainer.innerHTML = ''; // Vyčistit stará tlačítka

    // 'players' je globální proměnná z vašeho původního script.js
    if (players && players.length > 0) {
      players.forEach((player, index) => {
        const btn = document.createElement('button');
        btn.innerText = `${player.name} (+${data.value})`;
        btn.style.fontSize = '0.8em';
        btn.style.padding = '5px 10px';
        btn.style.cursor = 'pointer';

        btn.onclick = async () => {
          // Použijeme existující funkci updatePlayerPoints
          const points = parseInt(data.value, 10);
          await updatePlayerPoints(index, points);

          // Vizuální zpětná vazba
          btn.style.backgroundColor = 'green';
          btn.innerText = 'OK';
          setTimeout(() => {
            // Reset tlačítka po chvíli (volitelné)
            btn.style.backgroundColor = '';
            btn.innerText = `${player.name} (+${data.value})`;
          }, 2000);
        };

        buttonsContainer.appendChild(btn);
      });
    }
    // ------------------------------------------

  } else {
    box.style.display = 'none';
  }
});

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  createRemoteGrid();
  // Refresh points if server says so
  socket.on('points_updated', async () => {
    const updatedPlayers = await fetchPlayerData();
    // Simple refresh logic, can use your existing pollForUpdates logic too
    // But this is instant.
  });
});
