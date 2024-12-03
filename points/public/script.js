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
